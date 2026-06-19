import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/users/auth/auth.guard';
import {
  CreateBlockRequestDTO,
  CreateBlockRequestSchema,
  DeleteBlockURLParameters,
  DynamicBlockType,
} from 'src/blocks/blocks.dtos';
import { AuthContext, WithAuthContext } from 'src/users/auth/auth.guard';
import { getSearchableString } from 'src/strings/get-searchable-string';
import { DataSource } from 'typeorm';
import { Land } from 'src/land/land.entities';
import { AppBlock } from './app-block.entities';
import { DoorBlock } from './door-block.entities';
import { NavigationState } from 'src/navigation/state/navigation-state.entities';
import { ZodValidationPipe } from 'src/zod/zod.pipe';

@UseGuards(AuthGuard)
@Controller('blocks')
export class BlocksController {
  constructor(private dataSource: DataSource) {}

  @Post()
  createBlock(
    @Body(new ZodValidationPipe(CreateBlockRequestSchema)) body: CreateBlockRequestDTO,
    @WithAuthContext() authContext: AuthContext,
  ) {
    if (!authContext.user.isAdmin) {
      throw new ForbiddenException();
    }

    return this.dataSource.transaction(async (e) => {
      const landRepository = e.getRepository(Land);

      let landQuery = landRepository
        .createQueryBuilder('land')
        .where('land.id = :id', { id: body.landId })
        .leftJoinAndSelect('land.world', 'world');

      if (!authContext.user.isAdmin) {
        landQuery = landQuery.andWhere('world.user = :userId', {
          userId: authContext.user.id,
        });
      }

      const land = await landQuery.getOne();

      if (!land) {
        throw new NotFoundException({ error: 'land-not-found' });
      }

      const doorBlocks = await land.doorBlocks;
      const appBlocks = await land.appBlocks;

      if (doorBlocks.length + appBlocks.length > 50) {
        throw new BadRequestException({ error: 'block-limit-exceeded' });
      }

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (body.data.type === DynamicBlockType.Door) {
        const doorBlockRepository = e.getRepository(DoorBlock);

        const toLand = await landRepository.findOne({
          where: {
            searchableName: getSearchableString(body.data.destinationLandName),
          },
        });

        if (!toLand) {
          throw new NotFoundException({
            error: 'destination-land-not-found',
          });
        }

        if (land.world) {
          if (!toLand.world || toLand.world.id !== land.world.id) {
            throw new ForbiddenException({
              error: 'land-is-outside-world',
            });
          }
        }

        if (!land.world && toLand.world) {
          throw new ForbiddenException({
            error: 'land-is-outside-world',
          });
        }

        await doorBlockRepository.save(new DoorBlock({
          inLand: land,
          toLand,
        }));

        toLand.updatedAt = new Date();

        await landRepository.save(toLand);

        return;
      } else if (body.data.type === DynamicBlockType.App) {
        const appBlockRepository = e.getRepository(AppBlock);

        await appBlockRepository.save(new AppBlock({
          inLand: land,
          url: body.data.url,
        }));
      } else {
        throw new BadRequestException();
      }

      land.updatedAt = new Date();
      await landRepository.save(land);
    });
  }

  @HttpCode(204)
  @Delete('/:blockType/:blockId')
  deleteBlock(
    @Param() param: DeleteBlockURLParameters,
    @WithAuthContext() authContext: AuthContext,
  ) {
    if (!authContext.user.isAdmin) {
      throw new ForbiddenException();
    }

    return this.dataSource.transaction(async (e) => {
      const landRepository = e.getRepository(Land);

      if (param.blockType === DynamicBlockType.Door) {
        const doorBlock = await e.getRepository(DoorBlock).findOne({
          where: { id: param.blockId },
        });

        if (!doorBlock) {
          throw new NotFoundException();
        }

        // Inline DoorBlockRepository.remove logic: update NavigationState
        await e.getRepository(NavigationState).update(
          { lastDoor: doorBlock },
          {
            lastDoor: null,
            cameBack: null,
            lastPlayedBackgroundMusicUrl: null,
            lastCheckpointWasDeleted: true,
          },
        );

        await e.getRepository(DoorBlock).remove(doorBlock);

        if (doorBlock.inLand) {
          doorBlock.inLand.updatedAt = new Date();
          await landRepository.save(doorBlock.inLand);
        }
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      } else if (param.blockType === DynamicBlockType.App) {
        const appBlock = await e.getRepository(AppBlock).findOne({
          where: { id: param.blockId },
        });

        if (!appBlock) {
          throw new NotFoundException();
        }

        await e.getRepository(AppBlock).remove(appBlock);

        if (appBlock.inLand) {
          appBlock.inLand.updatedAt = new Date();
          await landRepository.save(appBlock.inLand);
        }
      } else {
        throw new Error();
      }
    });
  }
}

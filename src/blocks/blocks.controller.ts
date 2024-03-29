import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  HttpCode,
  Param,
  Post,
} from '@nestjs/common';
import { CreateBlockRequestDTO } from 'libs/shared/src/blocks/create/create-block.dto';
import { DynamicBlockType } from 'libs/shared/src/blocks/create/create-block.enums';
import { DeleteBlockURLParameters } from 'libs/shared/src/blocks/delete/delete-block.dto';
import { AuthContext } from 'src/auth/auth-context';
import { WithAuthContext } from 'src/auth/auth-context.decorator';
import { Role } from 'src/auth/roles/roles';
import { RolesUpAndIncluding } from 'src/auth/roles/roles.decorator';
import { AuditContext } from 'src/internals/auditing/audit-context';
import { WithAuditContext } from 'src/internals/auditing/audit.decorator';
import { InjectTypeormConnection } from 'src/internals/databases/inject-typeorm-connection.decorator';
import { ResourceNotFoundException } from 'src/internals/server/resource-not-found.exception';
import { getSearchableName } from 'src/internals/utils/get-searchable-name';
import { LandRepository } from 'src/land/typeorm/land.repository';
import { Connection } from 'typeorm';
import { AppBlockRepository } from './typeorm/app-block.repository';
import { DoorBlockRepository } from './typeorm/door-block.repository';

@Controller('blocks')
export class BlocksController {
  constructor(@InjectTypeormConnection() private connection: Connection) {}

  @Post()
  @RolesUpAndIncluding(Role.Admin)
  createBlock(
    @Body() body: CreateBlockRequestDTO,
    @WithAuditContext() auditContext: AuditContext,
    @WithAuthContext() authContext: AuthContext,
  ) {
    return this.connection.transaction(async (e) => {
      const landRepository = e.getCustomRepository(LandRepository);

      const land = await landRepository.selectOne(
        {
          alias: 'land',
        },

        (qb) => {
          let resQb = qb;

          resQb = resQb.where('land.id = :id', { id: body.landId });

          if (authContext.user.role !== Role.Admin) {
            resQb = resQb
              .leftJoinAndSelect('land.world', 'world')
              .andWhere('world.user = :userId', {
                userId: authContext.user.id,
              });
          }

          return resQb;
        },
      );

      if (!land) {
        throw new ResourceNotFoundException({ error: 'land-not-found' });
      }

      const doorBlocks = await land.doorBlocks;

      if (doorBlocks.length + land.appBlocks.length > 50) {
        throw new BadRequestException({ error: 'block-limit-exceeded' });
      }

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (body.data.type === DynamicBlockType.Door) {
        const doorBlockRepository = e.getCustomRepository(DoorBlockRepository);

        const toLand = await landRepository.findOne({
          where: {
            searchableName: getSearchableName(body.data.destinationLandName),
          },
        });

        if (!toLand) {
          throw new ResourceNotFoundException({
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

        await doorBlockRepository.create(
          {
            inLand: land,
            inTerritory: Promise.resolve(null),
            toLand,
          },
          auditContext,
        );

        toLand.updatedAt = new Date();

        await landRepository.save(toLand, auditContext);

        return;
      } else if (body.data.type === DynamicBlockType.App) {
        const appBlockRepository = e.getCustomRepository(AppBlockRepository);

        const appBlock = await appBlockRepository.create(
          {
            inLand: Promise.resolve(land),
            inTerritory: Promise.resolve(null),
            url: body.data.url,
          },
          auditContext,
        );

        land.appBlocks.push(appBlock);
      } else {
        throw new BadRequestException();
      }

      land.updatedAt = new Date();
      await landRepository.save(land, auditContext);
    });
  }

  @HttpCode(204)
  @Delete('/:blockType/:blockId')
  @RolesUpAndIncluding(Role.Admin)
  deleteBlock(
    @Param() param: DeleteBlockURLParameters,
    @WithAuditContext() auditContext: AuditContext,
  ) {
    return this.connection.transaction(async (e) => {
      const landRepository = e.getCustomRepository(LandRepository);
      const blockRepository = e.getCustomRepository(
        (() => {
          if (param.blockType === DynamicBlockType.Door) {
            return DoorBlockRepository;
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          } else if (param.blockType === DynamicBlockType.App) {
            return AppBlockRepository;
          } else {
            throw new Error();
          }
        })(),
      );

      const block = await blockRepository.findOne({
        where: { id: param.blockId },
      });

      if (!block) {
        throw new ResourceNotFoundException();
      }

      await blockRepository.remove(block);

      if (block.inLand) {
        block.inLand.updatedAt = new Date();
        await landRepository.save(block.inLand, auditContext);
      }
    });
  }
}

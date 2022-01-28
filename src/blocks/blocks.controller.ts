import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  Post,
} from '@nestjs/common';
import { InjectConnection } from 'nestjs-typeorm-bartmr';
import { CreateBlockRequestDTO } from 'libs/shared/src/blocks/create/create-block.dto';
import { BlockType } from 'libs/shared/src/blocks/create/create-block.enums';
import { DeleteBlockURLParameters } from 'libs/shared/src/blocks/delete/delete-block.dto';
import { Role } from 'src/auth/roles/roles';
import { RolesUpAndIncluding } from 'src/auth/roles/roles.decorator';
import { AuditContext } from 'src/internals/auditing/audit-context';
import { WithAuditContext } from 'src/internals/auditing/audit.decorator';
import { ResourceNotFoundException } from 'src/internals/server/resource-not-found.exception';
import { getSearchableName } from 'src/internals/utils/get-searchable-name';
import { LandRepository } from 'src/land/typeorm/land.repository';
import { Connection } from 'typeorm-bartmr';
import { DoorBlockRepository } from './typeorm/door-block.repository';

@Controller('blocks')
export class BlocksController {
  constructor(@InjectConnection() private connection: Connection) {}

  @Post()
  @RolesUpAndIncluding(Role.Admin)
  createBlock(
    @Body() body: CreateBlockRequestDTO,
    @WithAuditContext() auditContext: AuditContext,
  ) {
    return this.connection.transaction(async (e) => {
      const landRepository = e.getCustomRepository(LandRepository);

      const land = await landRepository.findOne({
        where: { id: body.landId },
      });

      if (!land) {
        throw new ResourceNotFoundException({ error: 'land-not-found' });
      }

      const landBlocks = await land.doorBlocks;

      if (landBlocks.length > 10) {
        throw new BadRequestException({ error: 'block-limit-exceeded' });
      }

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (body.data.type === BlockType.Door) {
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

        await doorBlockRepository.create(
          {
            inLand: land,
            inTerritory: Promise.resolve(null),
            toLand,
          },
          auditContext,
        );

        return;
      } else {
        throw new BadRequestException();
      }
    });
  }

  @HttpCode(204)
  @Delete('/doors/:blockId')
  @RolesUpAndIncluding(Role.Admin)
  deleteBlock(
    @Param() param: DeleteBlockURLParameters,
    @WithAuditContext() auditContext: AuditContext,
  ) {
    return this.connection.transaction(async (e) => {
      const doorBlocksRepository = e.getCustomRepository(DoorBlockRepository);

      const block = await doorBlocksRepository.findOne({
        where: { id: param.blockId },
      });

      if (!block) {
        throw new ResourceNotFoundException();
      }

      await doorBlocksRepository.remove(block, auditContext);
    });
  }
}

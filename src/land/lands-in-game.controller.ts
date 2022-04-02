import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { GetLandDTO } from 'libs/shared/src/land/get/get-land.dto';
import { NavigateToLandQueryDTO } from 'libs/shared/src/land/in-game/navigate/navigate-to-land.schemas';
import { PublicRoute } from 'src/auth/public-route.decorator';
import { DoorBlockRepository } from 'src/blocks/typeorm/door-block.repository';
import { ResourceNotFoundException } from 'src/internals/server/resource-not-found.exception';
import { Connection } from 'typeorm';
import { LandsService } from './lands.service';
import { LandRepository } from './typeorm/land.repository';

@Controller('lands')
export class LandsInGameController {
  constructor(
    @InjectConnection() private connection: Connection,
    private landService: LandsService,
  ) {}

  @Get('/resume')
  @PublicRoute()
  async resume(): Promise<GetLandDTO> {
    const landsRepository = this.connection.getCustomRepository(LandRepository);

    const results = await landsRepository.find({
      order: {
        createdAt: 'ASC',
      },
      where: {
        hasAssets: true,
      },
      skip: 0,
    });

    const firstLand = results.rows[0];

    if (!firstLand) {
      throw new Error();
    }

    const land = await this.landService.getLand(firstLand.id);

    if (!land) {
      throw new ResourceNotFoundException();
    } else {
      return land;
    }
  }

  @Get('/navigate')
  @PublicRoute()
  async navigate(@Query() query: NavigateToLandQueryDTO): Promise<GetLandDTO> {
    const doorBlocksRepository =
      this.connection.getCustomRepository(DoorBlockRepository);

    const doorBlock = await doorBlocksRepository.findOne({
      where: { id: query.doorBlockId },
    });

    if (!doorBlock) {
      throw new ResourceNotFoundException();
    }

    let res: GetLandDTO;

    if (doorBlock.inLand) {
      if (query.currentLandId == doorBlock.toLand.id) {
        res = await this.landService.mapLand(doorBlock.inLand);
      } else if (query.currentLandId == doorBlock.inLand.id) {
        res = await this.landService.mapLand(doorBlock.toLand);
      } else {
        throw new BadRequestException();
      }
    } else {
      throw new Error();
    }

    return res;
  }
}

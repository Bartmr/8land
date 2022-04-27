import { InjectConnection } from '@nestjs/typeorm';
import { StorageService } from 'src/internals/storage/storage.service';
import { throwError } from 'src/internals/utils/throw-error';
import { Connection } from 'typeorm';
import { Land } from './typeorm/land.entity';
import { LandRepository } from './typeorm/land.repository';

export class LandsService {
  constructor(
    @InjectConnection() private connection: Connection,
    private storageService: StorageService,
  ) {}

  async getLand(landId: string) {
    const landsRepository = this.connection.getCustomRepository(LandRepository);

    const land = await landsRepository.findOne({
      where: {
        id: landId,
      },
    });

    if (!land) {
      return undefined;
    }

    return this.mapLand(land);
  }

  async mapLand(land: Land) {
    const [territories, doorBlocksReferencing, doorBlocks, appBlocks] =
      await Promise.all([
        land.territories,
        land.doorBlocksReferencing,
        land.doorBlocks,
        land.appBlocks,
      ]);

    return {
      id: land.id,
      name: land.name,
      backgroundMusicUrl: land.backgroundMusicUrl,
      assets: land.hasAssets
        ? {
            baseUrl: this.storageService.getHostUrl(),
            mapKey: `lands/${land.id}/map.json`,
            tilesetKey: `lands/${land.id}/tileset.png`,
          }
        : undefined,
      doorBlocksReferencing: doorBlocksReferencing.map((b) => {
        if (!b.inLand) throwError();

        return {
          id: b.id,
          fromLandId: b.inLand.id,
          fromLandName: b.inLand.name,
        };
      }),
      doorBlocks: doorBlocks.map((b) => {
        return {
          id: b.id,
          toLand: {
            id: b.toLand.id,
            name: b.toLand.name,
          },
        };
      }),
      appBlocks: appBlocks.map((b) => ({
        id: b.id,
        url: b.url,
      })),
      territories: territories.map((territory) => {
        return {
          id: territory.id,
          startX: territory.startX,
          startY: territory.startY,
          endX: territory.endX,
          endY: territory.endY,
          assets: territory.hasAssets
            ? {
                baseUrl: this.storageService.getHostUrl(),
                mapKey: `territories/${territory.id}/map.json`,
                tilesetKey: `territories/${territory.id}/tileset.png`,
              }
            : undefined,
          doorBlocks: territory.doorBlocks.map((b) => {
            return {
              id: b.id,
              toLand: {
                id: b.toLand.id,
                name: b.toLand.name,
              },
            };
          }),
          appBlocks: territory.appBlocks.map((b) => ({
            id: b.id,
            url: b.url,
          })),
        };
      }),
    };
  }
}
import { createTiledJSONSchema } from '@shared/src/land/upload-assets/upload-land-assets.schemas';
import { AppBlockRepository } from 'src/blocks/app-block.repository';
import { DoorBlockRepository } from 'src/blocks/door-block.repository';
import {
  ContentType,
  StorageService,
} from 'src/storage/storage.service';
import { getSearchableString } from 'src/strings/get-searchable-string';
import { Land } from 'src/land/land.entity';
import { LandRepository } from 'src/land/land.repository';
import { DoorBlock } from 'src/blocks/door-block.entity';
import { AppBlock } from 'src/blocks/app-block.entity';
import { EntityManager } from 'typeorm';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const readFile = promisify(fs.readFile);

export async function seedTrainStation({
  eM,
  landOutside,
  storageService,
}: {
  eM: EntityManager;
  landOutside: Land;
  storageService: StorageService;
}) {
  const landsRepo = eM.getCustomRepository(LandRepository);
  const doorBlocksRepo = eM.getCustomRepository(DoorBlockRepository);
  const appBlocksRepo = eM.getCustomRepository(AppBlockRepository);

  const trainStation = await landsRepo.create(
    new Land({
      name: 'Town of Humble Beginnings - Train Station',
      searchableName: getSearchableString(
        'Town of Humble Beginnings - Train Station',
      ),
      backgroundMusicUrl: 'https://api.soundcloud.com/tracks/1118223961',
      doorBlocks: Promise.resolve([]),
      doorBlocksReferencing: Promise.resolve([]),
      appBlocks: [],
      hasAssets: true,
      territories: Promise.resolve([]),
      world: null,
      isStartingLand: null,
      isTrainStation: true,
    }),
  );

  const entrance = await doorBlocksRepo.create(
    new DoorBlock({
      inLand: landOutside,
      toLand: trainStation,
      inTerritory: Promise.resolve(null),
    }),
  );

  const ticketMachine = await appBlocksRepo.create(
    new AppBlock({
      inLand: Promise.resolve(trainStation),
      inTerritory: Promise.resolve(null),
      url: 'http://localhost:8000/apps/train-ticket-machine',
    }),
  );

  const mapString = await readFile(
    path.resolve(process.cwd(), 'src/land/spec/assets/train-station-map.json'),
    { encoding: 'utf-8' },
  );
  const tileset = await readFile(
    path.resolve(
      process.cwd(),
      'src/land/spec/assets/train-station-tileset.png',
    ),
  );

  const map = createTiledJSONSchema({
    maxWidth: null,
    maxHeight: null,
  }).parse(JSON.parse(mapString) as unknown);

 

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  map.tilesets[0]!.tiles =
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    map.tilesets[0]!.tiles.map((tile) => {
      return {
        ...tile,
        properties: tile.properties?.map((prop) => {
          if (prop.name === 'entrance') {
            return {
              name: "entrance",
              type: "string",
              value: `door:${entrance.id}`,
            };
          } else if (prop.name === 'ticket-machine') {
            return {
              name: "ticket-machine",
              type: "string",
              value: `app:${ticketMachine.id}`,
            };
          } else {
            return prop;
          }
        }),
      };
    });

  await storageService.saveText(
    `lands/${trainStation.id}/map.json`,
    JSON.stringify(map),
    { contentType: ContentType.JSON },
  );
  await storageService.saveBuffer(
    `lands/${trainStation.id}/tileset.png`,
    tileset,
    { contentType: ContentType.PNG },
  );

  return {
    trainStationEntrance: entrance,
  };
}

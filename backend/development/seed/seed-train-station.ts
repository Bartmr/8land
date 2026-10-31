import {
  ContentType,
  StorageService,
} from 'src/storage/storage.service';
import { getSearchableString } from 'src/strings/get-searchable-string';
import { Land } from 'src/land/land.entities';
import { DoorBlock } from 'src/blocks/door-block.entities';
import { AppBlock } from 'src/blocks/app-block.entities';
import { EntityManager } from 'typeorm';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { createTiledJSONSchema } from 'src/land/land.dtos';

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
  const landsRepo = eM.getRepository(Land);
  const doorBlocksRepo = eM.getRepository(DoorBlock);
  const appBlocksRepo = eM.getRepository(AppBlock);

  const trainStation = await landsRepo.save(
    new Land({
      name: 'Town of Humble Beginnings - Train Station',
      searchableName: getSearchableString(
        'Town of Humble Beginnings - Train Station',
      ),
      backgroundMusicUrl: null,
      doorBlocks: Promise.resolve([]),
      doorBlocksReferencing: Promise.resolve([]),
      appBlocks: Promise.resolve([]),
      hasAssets: true,
      world: null,
      isStartingLand: null,
      isTrainStation: true,
    }),
  );

  const entrance = await doorBlocksRepo.save(
    new DoorBlock({
      inLand: landOutside,
      toLand: trainStation,
    }),
  );

  const ticketMachine = await appBlocksRepo.save(
    new AppBlock({
      inLand: trainStation,
      url: 'http://localhost:8000/apps/train-ticket-machine',
    }),
  );

  
  const mapString = await readFile(
    path.resolve(process.cwd(), 'development/seed/train-station-map.json'),
    { encoding: 'utf-8' },
  );
  const tileset = await readFile(
    path.resolve(
      process.cwd(),
      'development/seed/train-station-tileset.png',
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

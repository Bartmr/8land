import { createTiledJSONSchema } from 'libs/shared/src/land/upload-assets/upload-land-assets.schemas';
import { AppBlockRepository } from 'src/blocks/typeorm/app-block.repository';
import { DoorBlockRepository } from 'src/blocks/typeorm/door-block.repository';
import { AuditContext } from 'src/internals/auditing/audit-context';
import {
  ContentType,
  StorageService,
} from 'src/internals/storage/storage.service';
import { getSearchableName } from 'src/internals/utils/get-searchable-name';
import { Land } from 'src/land/typeorm/land.entity';
import { LandRepository } from 'src/land/typeorm/land.repository';
import { EntityManager } from 'typeorm';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const readFile = promisify(fs.readFile);

export async function seedTrainStation({
  eM,
  landOutside,
  auditContext,
  storageService,
}: {
  eM: EntityManager;
  landOutside: Land;
  auditContext: AuditContext;
  storageService: StorageService;
}) {
  const landsRepo = eM.getCustomRepository(LandRepository);
  const doorBlocksRepo = eM.getCustomRepository(DoorBlockRepository);
  const appBlocksRepo = eM.getCustomRepository(AppBlockRepository);

  const trainStation = await landsRepo.create(
    {
      name: 'Town of Humble Beginnings - Train Station',
      searchableName: getSearchableName(
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
    },
    auditContext,
  );

  const entrance = await doorBlocksRepo.create(
    {
      inLand: landOutside,
      toLand: trainStation,
      inTerritory: Promise.resolve(null),
    },
    auditContext,
  );

  const ticketMachine = await appBlocksRepo.create(
    {
      inLand: Promise.resolve(trainStation),
      inTerritory: Promise.resolve(null),
      url: 'http://localhost:8000/apps/train-ticket-machine',
    },
    auditContext,
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

  const mapRes = createTiledJSONSchema({
    maxWidth: null,
    maxHeight: null,
  }).validate(JSON.parse(mapString) as unknown);

  if (mapRes.errors) {
    throw new Error(JSON.stringify(mapRes.messagesTree));
  }

  const map = mapRes.value;

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  map.tilesets[0]!.tiles =
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    map.tilesets[0]!.tiles.map((tile) => {
      return {
        ...tile,
        properties: tile.properties?.map((prop) => {
          if (prop.name === 'entrance') {
            return {
              ...prop,
              value: `door:${entrance.id}`,
            };
          } else if (prop.name === 'ticket-machine') {
            return {
              ...prop,
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

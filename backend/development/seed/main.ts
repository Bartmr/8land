import dotenv from "dotenv"

dotenv.config()

import { createConnection } from 'typeorm';
import { getSearchableString } from 'src/strings/get-searchable-string';
import fs from 'fs';
import { promisify } from 'util';
import path from 'path';
import { DevStorageService } from 'src/storage/dev-storage.service';
import { LOCAL_TEMPORARY_FILES_PATH } from 'src/temporary-files';
import { seedTrainStation } from './seed-train-station';
import { EnvironmentVariables } from "src/environment-variables/environment-variables";
import { v4 } from "uuid";
import { User } from "src/users/user.entity";
import { Land } from "src/land/land.entity";
import { DoorBlock } from "src/blocks/door-block.entity";
import { AppBlock } from "src/blocks/app-block.entity";
import { AppDataSourceOptions } from "src/database/data-source";
import * as bcrypt from 'bcrypt';
import { createTiledJSONSchema } from "src/land/land.dto";

const readFile = promisify(fs.readFile);
const rm = promisify(fs.rm);


async function seed() {
  await rm(LOCAL_TEMPORARY_FILES_PATH, { recursive: true, force: true });

  const storageService = new DevStorageService();

  const defaultDBConnection = await createConnection(AppDataSourceOptions);

  await defaultDBConnection.runMigrations();

  const passwordHash = await bcrypt.hash('password123', 10);

  await defaultDBConnection.manager.transaction(async (eM) => {
    const usersRepository = eM.getRepository(User);

    const endUser = new User(
      {
        email: 'end-user@8land.com',
        passwordHash,
        isAdmin: false,
        appId: v4(),
      },
    )

    await usersRepository.save(
      endUser
    );

    const adminUser = new User(
      {
        email: 'admin@8land.com',
        passwordHash,
        isAdmin: true,
        appId: v4(),
      },
    )

    await usersRepository.save(
      adminUser
    );

    const landsRepository = eM.getRepository(Land);
    const doorBlocksRepository = eM.getRepository(DoorBlock);

    const expectationsBeach = await landsRepository.save(
      new Land({
        name: 'Expectations Beach',
        searchableName: getSearchableString('Expectations Beach'),
        backgroundMusicUrl: 'https://api.soundcloud.com/tracks/soundcloud%3Atracks%3A591562281',
        doorBlocks: Promise.resolve([]),
        doorBlocksReferencing: Promise.resolve([]),
        appBlocks: Promise.resolve([]),
        hasAssets: true,
        world: null,
        isStartingLand: null,
        isTrainStation: null,
      }),
    );

    

    const townOfHumbleBeginnings = await landsRepository.save(
      new Land({
        name: 'Town of Humble Beginnings',
        searchableName: getSearchableString('Town of Humble Beginnings'),
        backgroundMusicUrl: null,
        doorBlocks: Promise.resolve([]),
        doorBlocksReferencing: Promise.resolve([]),
        appBlocks: Promise.resolve([]),
        hasAssets: true,
        world: null,
        isStartingLand: null,
        isTrainStation: null,
      }),
    );

    /* ----- */

    const expectationsBeachDoor1 = await doorBlocksRepository.save(
      new DoorBlock({
        inLand: expectationsBeach,
        toLand: expectationsBeach,
      }),
    );

    const expectationsBeachDoor2 = await doorBlocksRepository.save(
      new DoorBlock({
        inLand: expectationsBeach,
        toLand: townOfHumbleBeginnings,
      }),
    );

    const expectationsBeachMapString = await readFile(
      path.resolve(
        process.cwd(),
        'development/seed/expectations-beach-map.json',
      ),
      { encoding: 'utf-8' },
    );
    const expectationsBeachTileset = await readFile(
      path.resolve(
        process.cwd(),
        'development/seed/expectations-beach-tileset.png',
      ),
    );

    const expectationsBeachMap = createTiledJSONSchema({
      maxWidth: null,
      maxHeight: null,
    }).parse(JSON.parse(expectationsBeachMapString) as unknown);


    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expectationsBeachMap.tilesets[0]!.tiles =
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expectationsBeachMap.tilesets[0]!.tiles.map((tile) => {
        return {
          ...tile,
          properties: tile.properties?.map((prop) => {
            if (prop.name === 'start') {
              return {
                name: "start",
                type: "string" as const,
                value: `door:${expectationsBeachDoor1.id}`,
              };
            } else if (prop.name === 'town') {
              return {
                name: "town",
                type: "string" as const,
                value: `door:${expectationsBeachDoor2.id}`,
              };
            } else {
              return prop;
            }
          }),
        };
      });

    await storageService.saveText(
      `lands/${expectationsBeach.id}/map.json`,
      JSON.stringify(expectationsBeachMap),
    );
    await storageService.saveBuffer(
      `lands/${expectationsBeach.id}/tileset.png`,
      expectationsBeachTileset,
    );


    const townOfHumbleBeginningsMapString = await readFile(
      path.resolve(
        process.cwd(),
        'development/seed/town-of-humble-beginnings-map.json',
      ),
      { encoding: 'utf-8' },
    );
    const townOfHumbleBeginningsTileset = await readFile(
      path.resolve(
        process.cwd(),
        'development/seed/town-of-humble-beginnings-tileset.png',
      ),
    );

    const townOfHumbleBeginningsMap = createTiledJSONSchema({
      maxWidth: null,
      maxHeight: null,
    }).parse(JSON.parse(townOfHumbleBeginningsMapString) as unknown);


    const { trainStationEntrance } = await seedTrainStation({
      landOutside: townOfHumbleBeginnings,
      storageService,
      eM,
    });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    townOfHumbleBeginningsMap.tilesets[0]!.tiles =
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      townOfHumbleBeginningsMap.tilesets[0]!.tiles.map((tile) => {
        return {
          ...tile,
          properties: tile.properties?.map((prop) => {
            if (prop.name === 'beach') {
              return {
                ...prop,
                value: `door:${expectationsBeachDoor2.id}`,
              };
            } else if (prop.name === 'train-station-entrance') {
              return {
                ...prop,
                value: `door:${trainStationEntrance.id}`,
              };
            } else {
              return prop;
            }
          }),
        };
      });

    await storageService.saveText(
      `lands/${townOfHumbleBeginnings.id}/map.json`,
      JSON.stringify(townOfHumbleBeginningsMap),
    );
    await storageService.saveBuffer(
      `lands/${townOfHumbleBeginnings.id}/tileset.png`,
      townOfHumbleBeginningsTileset,
    );

  });

  await defaultDBConnection.close();
}

seed().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

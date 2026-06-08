import dotenv from "dotenv"

dotenv.config()

import { createConnection } from 'typeorm';
import { getSearchableString } from 'src/strings/get-searchable-string';
import fs from 'fs';
import { promisify } from 'util';
import path from 'path';
import { DevStorageService } from 'src/storage/dev-storage.service';
import { LOCAL_TEMPORARY_FILES_PATH } from 'src/temporary-files';
import { createTiledJSONSchema } from 'src/land/upload-assets/upload-land-assets.schemas';
import { seedTrainStation } from './seed/seed-train-station';
import { EnvironmentVariables } from "src/environment-variables/environment-variables";
import { v4 } from "uuid";
import { User } from "src/users/user.entity";
import { Land } from "src/land/land.entity";
import { DoorBlock } from "src/blocks/door-block.entity";
import { AppBlock } from "src/blocks/app-block.entity";
import { AppDataSourceOptions } from "src/database/data-source";
import * as bcrypt from 'bcrypt';

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
    const appBlocksRepository = eM.getRepository(AppBlock);

    const expectationsBeach = await landsRepository.save(
      new Land({
        name: 'Expectations Beach',
        searchableName: getSearchableString('Expectations Beach'),
        backgroundMusicUrl: 'https://api.soundcloud.com/tracks/256813580',
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
        backgroundMusicUrl: 'https://api.soundcloud.com/tracks/566456658',
        doorBlocks: Promise.resolve([]),
        doorBlocksReferencing: Promise.resolve([]),
        appBlocks: Promise.resolve([]),
        hasAssets: true,
        world: null,
        isStartingLand: null,
        isTrainStation: null,
      }),
    );

    const townOfHumbleBeginningsApp1 = await appBlocksRepository.save(
      new AppBlock({
        inLand: townOfHumbleBeginnings,
        url: 'http://localhost:8000/apps/test',
      }),
    );

    const townOfHumbleBeginningsUnderground1 = await landsRepository.save(
      new Land({
        name: 'Town of Humble Beginnings - Underground 1',
        searchableName: getSearchableString(
          'Town of Humble Beginnings - Underground 1',
        ),
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

    const townOfHumbleBeginningsUnderground2 = await landsRepository.save(
      new Land({
        name: 'Town of Humble Beginnings - Underground 2',
        searchableName: getSearchableString(
          'Town of Humble Beginnings - Underground 2',
        ),
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

    const townOfHumbleBeginningsTemple = await landsRepository.save(
      new Land({
        name: 'Town of Humble Beginnings - Temple',
        searchableName: getSearchableString('Town of Humble Beginnings - Temple'),
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
        'development/seed/land/assets/expectations-beach-map.json',
      ),
      { encoding: 'utf-8' },
    );
    const expectationsBeachTileset = await readFile(
      path.resolve(
        process.cwd(),
        'development/seed/land/assets/expectations-beach-tileset.png',
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

    /* ----- */

    const townOfHumbleBeginningsDoor1 = await doorBlocksRepository.save(
      new DoorBlock({
        inLand: townOfHumbleBeginnings,
        toLand: townOfHumbleBeginningsUnderground1,
      }),
    );

    const townOfHumbleBeginningsDoor2 = await doorBlocksRepository.save(
      new DoorBlock({
        inLand: townOfHumbleBeginnings,
        toLand: townOfHumbleBeginningsUnderground2,
      }),
    );

    const townOfHumbleBeginningsDoor3 = await doorBlocksRepository.save(
      new DoorBlock({
        inLand: townOfHumbleBeginnings,
        toLand: townOfHumbleBeginningsTemple,
      }),
    );

    const townOfHumbleBeginningsMapString = await readFile(
      path.resolve(
        process.cwd(),
        'development/seed/land/assets/town-of-humble-beginnings-map.json',
      ),
      { encoding: 'utf-8' },
    );
    const townOfHumbleBeginningsTileset = await readFile(
      path.resolve(
        process.cwd(),
        'development/seed/land/assets/town-of-humble-beginnings-tileset.png',
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
            if (prop.name === 'underground-entrance') {
              return {
                ...prop,
                value: `door:${townOfHumbleBeginningsDoor1.id}`,
              };
            } else if (prop.name === 'temple') {
              return {
                ...prop,
                value: `door:${townOfHumbleBeginningsDoor3.id}`,
              };
            } else if (prop.name === 'form') {
              return {
                ...prop,
                value: `app:${townOfHumbleBeginningsApp1.id}`,
              };
            } else if (prop.name === 'underground') {
              return {
                ...prop,
                value: `door:${townOfHumbleBeginningsDoor2.id}`,
              };
            } else if (prop.name === 'beach') {
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

    /* ----- */

    const townOfHumbleBeginningsUnderground1Door1 =
      await doorBlocksRepository.save(
        new DoorBlock({
          inLand: townOfHumbleBeginningsUnderground1,
          toLand: townOfHumbleBeginningsUnderground2,
        }),
      );

    const townOfHumbleBeginningsUnderground1MapString = await readFile(
      path.resolve(
        process.cwd(),
        'development/seed/land/assets/town-of-humble-beginnings-underground-1-map.json',
      ),
      { encoding: 'utf-8' },
    );
    const townOfHumbleBeginningsUnderground1Tileset = await readFile(
      path.resolve(
        process.cwd(),
        'development/seed/land/assets/town-of-humble-beginnings-underground-1-tileset.png',
      ),
    );

    const townOfHumbleBeginningsUnderground1Map = createTiledJSONSchema({
      maxWidth: null,
      maxHeight: null,
    }).parse(
      JSON.parse(townOfHumbleBeginningsUnderground1MapString) as unknown,
    );

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    townOfHumbleBeginningsUnderground1Map.tilesets[0]!.tiles =
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      townOfHumbleBeginningsUnderground1Map.tilesets[0]!.tiles.map((tile) => {
        return {
          ...tile,
          properties: tile.properties?.map((prop) => {
            if (prop.name === 'underground') {
              return {
                ...prop,
                value: `door:${townOfHumbleBeginningsUnderground1Door1.id}`,
              };
            } else if (prop.name === 'town') {
              return {
                ...prop,
                value: `door:${townOfHumbleBeginningsDoor1.id}`,
              };
            } else {
              return prop;
            }
          }),
        };
      });

    await storageService.saveText(
      `lands/${townOfHumbleBeginningsUnderground1.id}/map.json`,
      JSON.stringify(townOfHumbleBeginningsUnderground1Map),
    );
    await storageService.saveBuffer(
      `lands/${townOfHumbleBeginningsUnderground1.id}/tileset.png`,
      townOfHumbleBeginningsUnderground1Tileset,
    );

    /* ----- */

    const townOfHumbleBeginningsUnderground2MapString = await readFile(
      path.resolve(
        process.cwd(),
        'development/seed/land/assets/town-of-humble-beginnings-underground-2-map.json',
      ),
      { encoding: 'utf-8' },
    );
    const townOfHumbleBeginningsUnderground2Tileset = await readFile(
      path.resolve(
        process.cwd(),
        'development/seed/land/assets/town-of-humble-beginnings-underground-2-tileset.png',
      ),
    );

    const townOfHumbleBeginningsUnderground2Map = createTiledJSONSchema({
      maxWidth: null,
      maxHeight: null,
    }).parse(
      JSON.parse(townOfHumbleBeginningsUnderground2MapString) as unknown,
    );

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    townOfHumbleBeginningsUnderground2Map.tilesets[0]!.tiles =
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      townOfHumbleBeginningsUnderground2Map.tilesets[0]!.tiles.map((tile) => {
        return {
          ...tile,
          properties: tile.properties?.map((prop) => {
            if (prop.name === 'town') {
              return {
                ...prop,
                value: `door:${townOfHumbleBeginningsDoor2.id}`,
              };
            } else if (prop.name === 'entrance') {
              return {
                ...prop,
                value: `door:${townOfHumbleBeginningsUnderground1Door1.id}`,
              };
            } else {
              return prop;
            }
          }),
        };
      });

    await storageService.saveText(
      `lands/${townOfHumbleBeginningsUnderground2.id}/map.json`,
      JSON.stringify(townOfHumbleBeginningsUnderground2Map),
    );
    await storageService.saveBuffer(
      `lands/${townOfHumbleBeginningsUnderground2.id}/tileset.png`,
      townOfHumbleBeginningsUnderground2Tileset,
    );

    /* --- */

    /* ----- */

    const townOfHumbleBeginningsTempleMapString = await readFile(
      path.resolve(
        process.cwd(),
        'development/seed/land/assets/town-of-humble-beginnings-temple-map.json',
      ),
      { encoding: 'utf-8' },
    );
    const townOfHumbleBeginningsTempleTileset = await readFile(
      path.resolve(
        process.cwd(),
        'development/seed/land/assets/town-of-humble-beginnings-temple-tileset.png',
      ),
    );

    const townOfHumbleBeginningsTempleMap = createTiledJSONSchema({
      maxWidth: null,
      maxHeight: null,
    }).parse(JSON.parse(townOfHumbleBeginningsTempleMapString) as unknown);



    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    townOfHumbleBeginningsTempleMap.tilesets[0]!.tiles =
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      townOfHumbleBeginningsTempleMap.tilesets[0]!.tiles.map((tile) => {
        return {
          ...tile,
          properties: tile.properties?.map((prop) => {
            if (prop.name === 'town') {
              return {
                ...prop,
                value: `door:${townOfHumbleBeginningsDoor3.id}`,
              };
            } else {
              return prop;
            }
          }),
        };
      });

    await storageService.saveText(
      `lands/${townOfHumbleBeginningsTemple.id}/map.json`,
      JSON.stringify(townOfHumbleBeginningsTempleMap),
    );
    await storageService.saveBuffer(
      `lands/${townOfHumbleBeginningsTemple.id}/tileset.png`,
      townOfHumbleBeginningsTempleTileset,
    );

  });

  await defaultDBConnection.close();
}

seed().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

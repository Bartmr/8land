import { ToIndexedType } from '@app/shared/internals/transports/dto-types';
import { throwError } from '@app/shared/internals/utils/throw-error';
import { BlockType } from '@app/shared/blocks/create/create-block.enums';
import { GetLandDTO } from '@app/shared/land/get/get-land.dto';
import { JSONApiBase } from 'src/logic/app-internals/apis/json-api-base';
import { EnvironmentVariables } from 'src/logic/app-internals/runtime/environment-variables';
import { TransportFailure } from 'src/logic/app-internals/transports/transported-data/transport-failures';
import { HotReloadClass } from 'src/logic/app-internals/utils/hot-reload-class';
import { GridPhysics } from './grid-physics';
import { Direction } from './grid.types';
import {
  getLandSceneKey,
  getLandSceneTiledJSONKey,
  getLandSceneTilesetKey,
  getTerritoryTiledJSONKey,
  getTerritoryTilesetKey,
} from './keys';
import { Block, DoorBlock, LandSceneArguments } from './land-scene.types';
import { Player } from './player';
import { TiledJSON } from './tiled.types';
import { TILE_SIZE } from '../../../../game-constants';
import { MusicService } from '../../music-ticker';
import { DialogueService } from '../dialogue/dialogue-screen';
import { LandScreenService } from './land-screen.service';

@HotReloadClass(module)
export class LandScene extends Phaser.Scene {
  private gridPhysics?: GridPhysics;

  protected previousLandSceneArguments: LandSceneArguments | null;
  protected args: LandSceneArguments;
  protected dependencies: {
    musicService: MusicService;
    dialogueService: DialogueService;
    api: JSONApiBase;
    changeLandNameDisplay: (landName: string) => void;
    landScreenService: LandScreenService;
  };

  // Populated when loading plugin
  private animatedTiles = null as unknown as {
    init(map: Phaser.Tilemaps.Tilemap): void;
    resetRates(mapIndex: number): void;
    setRate(rate: number, gid?: number, map?: Phaser.Tilemaps.Tilemap): void;
    resume(layerIndex: number, mapIndex: number): void;
    pause(layerIndex: number, mapIndex: number): void;
  };

  constructor(
    previousLandSceneArguments: LandScene['previousLandSceneArguments'],
    args: LandScene['args'],
    deps: LandScene['dependencies'],
  ) {
    super({
      key: getLandSceneKey(args.land),
      active: false,
      visible: false,
    });

    this.previousLandSceneArguments = previousLandSceneArguments;
    this.args = args;
    this.dependencies = deps;

    deps.landScreenService.currentScene = this;
  }

  public create() {
    if (this.previousLandSceneArguments) {
      this.scene.remove(getLandSceneKey(this.previousLandSceneArguments.land));
    }

    this.dependencies.changeLandNameDisplay(this.args.land.name);

    // LAND
    const landTiledJSON =
      (
        this.cache.tilemap.get(getLandSceneTiledJSONKey(this.args.land)) as
          | { data: TiledJSON }
          | undefined
      )?.data || throwError();

    const landFirstTileset = landTiledJSON.tilesets[0] || throwError();

    const landMap = this.make.tilemap({
      key: getLandSceneTiledJSONKey(this.args.land),
    });
    landMap.addTilesetImage(
      landFirstTileset.name,
      getLandSceneTilesetKey(this.args.land),
    );

    const landLayer = landMap.createLayer(0, landFirstTileset.name, 0, 0);
    landLayer.setDepth(0);

    this.animatedTiles.init(landMap);
    //

    // PROPERTIES
    const territoryContexts: Array<{
      id: string;
      startX: number;
      endX: number;
      startY: number;
      endY: number;
      tilemap: Phaser.Tilemaps.Tilemap;
      blocks: Block[];
    }> = [];
    for (let i = 0; i < this.args.land.territories.length; i++) {
      const territory = this.args.land.territories[i] || throwError();

      const territoryTiledJSON = (
        this.cache.tilemap.get(getTerritoryTiledJSONKey(territory)) as
          | { data: TiledJSON }
          | undefined
      )?.data;

      const territoryFirstTileset =
        (territoryTiledJSON || throwError()).tilesets[0] || throwError();

      const territoryMap = this.make.tilemap({
        key: getTerritoryTiledJSONKey(territory),
      });
      territoryMap.addTilesetImage(
        territoryFirstTileset.name,
        getTerritoryTilesetKey(territory),
      );
      territoryContexts.push({
        id: territory.id,
        startX: territory.startX,
        endX: territory.endX,
        startY: territory.startY,
        endY: territory.endY,
        tilemap: territoryMap,
        blocks: territory.doorBlocks.map((dB) => {
          return {
            type: BlockType.Door,
            toLandId: dB.toLand.id,
            id: dB.id,
          };
        }),
      });

      const territoryLayer = territoryMap.createLayer(
        0,
        territoryFirstTileset.name,
        territory.startX * TILE_SIZE,
        territory.startY * TILE_SIZE,
      );

      territoryLayer.setDepth(1 + i);

      this.animatedTiles.init(territoryMap);
    }
    //

    let position: { x: number; y: number } | undefined;

    // Search for tile that matches this.previousLandSceneArguments.comingFromDoorBlock
    // and get its position. start sprite from there
    for (const layer of landMap.layers) {
      for (const row of layer.data) {
        for (const tile of row) {
          const properties = Object.keys(
            tile.properties as { [key: string]: unknown },
          ).filter(
            (key) => !!(tile.properties as { [key: string]: unknown })[key],
          );

          if (properties.includes(this.args.comingFromDoorBlock.id)) {
            position = {
              x: tile.x,
              y: tile.y,
            };
            break;
          }

          if (position) {
            break;
          }
        }

        if (position) {
          break;
        }
      }

      if (position) {
        break;
      }
    }

    // Returning block might be present in territory instead
    for (const territoryContext of territoryContexts) {
      for (const layer of territoryContext.tilemap.layers) {
        for (const row of layer.data) {
          for (const tile of row) {
            const properties = Object.keys(
              tile.properties as { [key: string]: unknown },
            ).filter(
              (key) => !!(tile.properties as { [key: string]: unknown })[key],
            );

            if (properties.includes(this.args.comingFromDoorBlock.id)) {
              position = {
                x: tile.x + territoryContext.startX,
                y: tile.y + territoryContext.startY,
              };
              break;
            }

            if (position) {
              break;
            }
          }

          if (position) {
            break;
          }
        }

        if (position) {
          break;
        }
      }

      if (position) {
        break;
      }
    }

    if (!position) {
      window.alert(
        'This territory does not have any exits. You should use the escape button to go back to the outdoors',
      );

      position = {
        x: 0,
        y: 0,
      };
    }

    const playerSprite = this.add.sprite(0, 0, 'player');
    playerSprite.setDepth(2);

    this.cameras.main.startFollow(playerSprite);
    this.cameras.main.roundPixels = true;
    this.cameras.main.setBounds(0, 0, landLayer.width, landLayer.height);

    const player = new Player(
      playerSprite,
      new Phaser.Math.Vector2(position.x, position.y),
    );

    this.gridPhysics = new GridPhysics(player, {
      land: {
        id: this.args.land.id,
        blocks: [
          ...this.args.land.doorBlocks.map((dB) => {
            return {
              type: BlockType.Door as const,
              toLandId: dB.toLand.id,
              id: dB.id,
            };
          }),
          ...this.args.land.doorBlocksReferencing.map((dB) => {
            return {
              type: BlockType.Door as const,
              toLandId: dB.fromLandId,
              id: dB.id,
            };
          }),
        ],
        tilemap: landMap,
      },
      territories: territoryContexts,
      onStepIntoDoor: async (block: DoorBlock) => {
        if (this.args.land.id === block.toLandId) {
          return;
        }

        (this.gridPhysics || throwError()).lock();

        await this.handleStepIntoDoor(block);
      },
      dialogueService: this.dependencies.dialogueService,
    });

    this.createPlayerAnimation(Direction.UP, 9, 8);
    this.createPlayerAnimation(Direction.RIGHT, 1, 0);
    this.createPlayerAnimation(Direction.DOWN, 6, 5);
    this.createPlayerAnimation(Direction.LEFT, 3, 2);
  }

  public update(_time: number, delta: number) {
    (this.gridPhysics || throwError()).update(delta);
  }

  public preload() {
    this.load.setBaseURL(`${(this.args.land.assets || throwError()).baseUrl}/`);
    this.load.image(
      getLandSceneTilesetKey(this.args.land),
      (this.args.land.assets || throwError()).tilesetKey,
    );
    this.load.tilemapTiledJSON(
      getLandSceneTiledJSONKey(this.args.land),
      (this.args.land.assets || throwError()).mapKey,
    );

    for (const territory of this.args.land.territories) {
      this.load.image(
        getTerritoryTilesetKey(territory),
        (territory.assets || throwError()).tilesetKey,
      );
      this.load.tilemapTiledJSON(
        getTerritoryTiledJSONKey(territory),
        (territory.assets || throwError()).mapKey,
      );
    }

    //

    this.load.spritesheet('player', this.args.player.spritesheetUrl, {
      frameWidth: 16,
      frameHeight: 16,
    });

    /*
      From https://github.com/nkholski/phaser-animated-tiles/blob/master/dist/AnimatedTiles.js
      commit a10cc9f on May 26, 2018
    */
    this.load.scenePlugin(
      'AnimatedTiles',
      `${EnvironmentVariables.HOST_URL}/AnimatedTiles.js`,
      'animatedTiles',
      'animatedTiles',
    );

    this.dependencies.musicService.playMusic(this.args.land.backgroundMusicUrl);
  }

  private createPlayerAnimation(
    name: string,
    startFrame: number,
    endFrame: number,
  ) {
    this.anims.create({
      key: name,
      frames: this.anims.generateFrameNumbers('player', {
        start: startFrame,
        end: endFrame,
      }),
      frameRate: 8,
      repeat: -1,
      yoyo: true,
    });
  }

  private async handleStepIntoDoor(block: DoorBlock) {
    const nextLandId = block.toLandId;

    this.dependencies.changeLandNameDisplay('-- Loading --');

    const res = await this.dependencies.api.get<
      { status: 200; body: ToIndexedType<GetLandDTO> },
      undefined
    >({
      path: `/lands/${nextLandId}`,
      query: undefined,
      acceptableStatusCodes: [200],
    });

    if (res.failure) {
      if (res.failure === TransportFailure.ConnectionFailure) {
        window.alert(
          "Couldn't connect to the Internet. Check your connection and enter the door again.",
        );
      } else if (res.failure === TransportFailure.NotFound) {
        window.alert("This path's destination no longer exists.");
      } else {
        window.alert(
          "There was an error loading what's further down this path. Try to enter it again later.",
        );
      }

      (this.gridPhysics || throwError()).unlock();

      this.dependencies.changeLandNameDisplay(this.args.land.name);

      return;
    }

    const nextLand = res.response.body;

    const sceneKey = getLandSceneKey(nextLand);

    this.scene.add(
      sceneKey,
      new LandScene(
        this.args,
        {
          player: this.args.player,
          land: {
            ...nextLand,
            territories: nextLand.territories.filter((t) => !!t.assets),
          },
          comingFromDoorBlock: block,
        },
        this.dependencies,
      ),
    );

    this.scene.stop(this.scene.key);

    this.scene.start(sceneKey);
  }
}

// TODO: remove previous scene assets and scene instance to avoid memory leaks

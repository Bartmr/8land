import { DynamicBlockType } from '../../../../../main-api/routes/blocks/blocks-api';
import { StaticBlockType } from '../../../../../main-api/routes/lands/lands-api';
import { EnvironmentVariables } from '../../../../../environment-variables';
import { CommunicationError } from '../../../../../communication-errors/communication-errors';
import { Direction, PlayerGrid, PlayerGridLandContext } from "./player-grid";
import {
  getLandSceneKey,
  getLandSceneTiledJSONKey,
  getLandSceneTilesetKey,
} from './keys';
import { Block, DoorBlock, LandSceneArguments } from './land-scene.types';
import { Player } from './player';
import { TiledJSON } from './tiled.types';
import { TILE_SIZE } from '../../game-constants';
import { MusicService } from '../../music-ticker';
import { DialogueService } from '../dialogue/dialogue-screen';
import { LandScreenService } from './land-screen.service';
import { AppService } from '../app/app-screen';
import { LandsAPI } from '../../../../../main-api/routes/lands/lands-api';
import { NavigateToLandDTO } from '../../../../../main-api/routes/lands/lands-api';
import { TrainAPI } from '../../../../../main-api/routes/train/train.api';
import { throwError } from '../../../../../throw-error';
import { KeypadBroker } from '../../keypad-broker';
import { Math } from 'phaser';

export class LandScene extends Phaser.Scene {
  protected previousLandSceneArguments: LandSceneArguments | null;
  protected args: LandSceneArguments;
  protected dependencies: {
    keypadBroker: KeypadBroker,
    musicService: MusicService;
    dialogueService: DialogueService;
    appService: AppService;
    landsAPI: LandsAPI;
    trainAPI: TrainAPI;
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

  private isLocked = false;

  private player?: Player;

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

  public getLandTiledJSON() {
    const landTiledJSON =
      (
        this.cache.tilemap.get(getLandSceneTiledJSONKey(this.args.land)) as
          | { data: TiledJSON }
          | undefined
      )?.data || throwError();

    return landTiledJSON
  }

  public create() {
    if (this.previousLandSceneArguments) {
      this.scene.remove(getLandSceneKey(this.previousLandSceneArguments.land));
    }

    this.dependencies.changeLandNameDisplay(this.args.land.name);

    // LAND
    
    const landTiledJSON = this.getLandTiledJSON();
    const landFirstTileset = landTiledJSON.tilesets[0] || throwError();

    const landMap = this.make.tilemap({
      key: getLandSceneTiledJSONKey(this.args.land),
    });
    landMap.addTilesetImage(
      landFirstTileset.name,
      getLandSceneTilesetKey(this.args.land),
    );

    let nextDepth = 0;

    landTiledJSON.layers.forEach(() => {
      const landLayer = landMap.createLayer(
        nextDepth,
        landFirstTileset.name,
        0,
        0,
      );
      if (!landLayer) {
        throw new Error();
      }
      landLayer.setDepth(nextDepth);

      nextDepth += 1;
    });

    this.animatedTiles.init(landMap);
    //

    let position: { x: number; y: number } | undefined;

    // Search for tile that matches this.previousLandSceneArguments.comingFromDoorBlock
    // and get its position. start sprite from there
    for (const layer of landMap.layers) {
      for (const row of layer.data) {
        for (const tile of row) {
          if (this.args.comingFrom.type === DynamicBlockType.Door) {
            const properties = Object.values(
              tile.properties as { [key: string]: unknown },
            );

            if (properties.includes(`door:${this.args.comingFrom.id}`)) {
              position = {
                x: tile.x,
                y: tile.y,
              };
              break;
            }
          } else if (this.args.comingFrom.type === StaticBlockType.Start) {
            const properties = Object.entries(
              tile.properties as { [key: string]: unknown },
            );

            if (
              properties.find(
                (p) => p[0] === StaticBlockType.Start && p[1] === true,
              )
            ) {
              position = {
                x: tile.x,
                y: tile.y,
              };
              break;
            }
          } else if (
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            this.args.comingFrom.type === StaticBlockType.TrainPlatform
          ) {
            const properties = Object.entries(
              tile.properties as { [key: string]: unknown },
            );

            if (
              properties.find(
                (p) => p[0] === StaticBlockType.TrainPlatform && p[1] === true,
              )
            ) {
              position = {
                x: tile.x,
                y: tile.y,
              };
              break;
            }
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
      this.dependencies.dialogueService.openText(
        'This land does not have any exits. You should use the back button in the user settings to go back to the outdoors',
      );

      position = {
        x: 0,
        y: 0,
      };
    }

    const playerPositionLandContext: PlayerGridLandContext = {
      land: {
        id: this.args.land.id,
        blocks: [
          ...this.args.land.doorBlocks.map((dB) => {
            return {
              type: DynamicBlockType.Door as const,
              toLandId: dB.toLand.id,
              id: dB.id,
            };
          }),
          ...this.args.land.doorBlocksReferencing.map((dB) => {
            return {
              type: DynamicBlockType.Door as const,
              toLandId: dB.fromLandId,
              id: dB.id,
            };
          }),
          ...this.args.land.appBlocks.map((aB) => {
            return {
              type: DynamicBlockType.App as const,
              url: aB.url,
              id: aB.id,
            };
          }),
        ],
        tilemap: landMap,
      },
      onStepIntoDoor: async (block) => {
        if (
          block.type === DynamicBlockType.Door &&
          this.args.land.id === block.toLandId
        ) {
          return;
        }

        this.isLocked = true;

        this.dependencies.changeLandNameDisplay('-- Loading --');

        const res = await this.handleStepIntoDoor(block);

        if (res === 'failed') {
          this.dependencies.changeLandNameDisplay(this.args.land.name);

          this.isLocked = false;
        }
      },
      dialogueService: this.dependencies.dialogueService,
      onOpenApp: (args) => {
        this.dependencies.appService.openApp({
          url: args.url,
          territory: args.territoryId
            ? {
                id: args.territoryId,
              }
            : undefined,
          // WARNING
          // DO NOT PASS THE WHOLE SESSION OBJECT!!! THAT'S A SECURITY HAZARD
          // ONLY PASS THE NEEDED ARGUMENTS
          user: this.args.session
            ? {
                appId: this.args.session.appId,
              }
            : undefined,
          land: { id: this.args.land.id, name: this.args.land.name },
        });
      },
    };

    this.player = new Player(
      this,
      nextDepth,
      new Math.Vector2(position.x, position.y),
      this.dependencies.keypadBroker,
      playerPositionLandContext
    );
  }

  public update(_time: number, delta: number) {
    if (this.isLocked) {
      return;
    }

    (this.player || throwError()).update(delta);
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

    //

    this.load.spritesheet('player', this.args.player.spritesheetUrl, {
      frameWidth: 16,
      frameHeight: 16,
    });

    this.load.scenePlugin(
      'AnimatedTiles',
      `${EnvironmentVariables.SITE_URL}/AnimatedTiles.js`,
      'animatedTiles',
      'animatedTiles',
    );

    this.dependencies.musicService.playMusic(this.args.land.backgroundMusicUrl);
  }

  private async handleStepIntoDoor(
    block:
      | DoorBlock
      | { type: StaticBlockType.Start }
      | { type: StaticBlockType.TrainPlatform },
  ): Promise<'ok' | 'failed'> {
    let nextLand: NavigateToLandDTO;

    let navType: 'door' | 'boarded-train' | 'back-to-start';

    if (block.type === DynamicBlockType.Door) {
      const res = await this.dependencies.landsAPI.navigate({
        doorBlockId: block.id,
        currentLandId: this.args.land.id,
      });

      if (res.error) {
        if (res.error === CommunicationError.ConnectionFailure) {
          this.dependencies.dialogueService.openText(
            "Couldn't connect to the Internet. Check your connection and enter the door again.",
          );
        } else if (res.error === CommunicationError.NotFound) {
          this.dependencies.dialogueService.openText(
            "This path's destination no longer exists.",
          );
        } else {
          this.dependencies.dialogueService.openText(
            "There was an error loading what's further down this path. Try to enter it again later.",
          );
        }

        return 'failed';
      }

      navType = 'door';
      nextLand = res.response.body;
    } else if (block.type === StaticBlockType.Start) {
      const res = await this.dependencies.trainAPI.returnToTrainStation();

      if (res.error) {
        if (res.error === CommunicationError.ConnectionFailure) {
          this.dependencies.dialogueService.openText(
            "Couldn't connect to the Internet. Check your connection and enter the door again.",
          );
        } else {
          this.dependencies.dialogueService.openText(
            "There was an error loading what's further down this path. Try to enter it again later.",
          );
        }

        return 'failed';
      }

      navType = 'back-to-start';
      nextLand = res.response.body;
      this.dependencies.musicService.pause();
    } else if (
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      block.type === StaticBlockType.TrainPlatform
    ) {
      const trainDestination = this.dependencies.trainAPI.getTrainDestination({
        currentStationLandId: this.args.land.id,
      });

      if (!trainDestination) {
        this.dependencies.dialogueService.openText(
          'You need to pick where you want to go first. Use the ticket machines available at this train station.',
        );

        return 'failed';
      }

      const res = await this.dependencies.trainAPI.board({
        worldId: trainDestination.worldId,
        boardingFromLand: this.args.land.id,
      });

      if (res.error) {
        if (res.error === CommunicationError.ConnectionFailure) {
          this.dependencies.dialogueService.openText(
            "Couldn't connect to the Internet. Check your connection and enter the door again.",
          );
        }
        if (res.error === CommunicationError.NotFound) {
          this.dependencies.trainAPI.clearTrainDestination({
            currentStationLandId: this.args.land.id,
          });

          this.dependencies.dialogueService.openText(
            'This destination no longer exists. Please pick another destination in the ticket machines available at this train station.',
          );
        } else {
          this.dependencies.dialogueService.openText(
            "There was an error loading what's further down this path. Try to enter it again later.",
          );
        }

        return 'failed';
      }

      this.dependencies.trainAPI.clearTrainDestination({
        currentStationLandId: this.args.land.id,
      });

      navType = 'boarded-train';
      nextLand = res.response.body;
      this.dependencies.musicService.pause();
    } else {
      throw new Error();
    }

    const sceneKey = getLandSceneKey(nextLand);

    this.scene.add(
      sceneKey,
      new LandScene(
        this.args,
        {
          player: this.args.player,
          land: {
            ...nextLand,
          },
          comingFrom: (() => {
            if (navType === 'door') {
              return block;
            } else if (navType === 'boarded-train') {
              return {
                type: StaticBlockType.Start,
              };
            }
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            else if (navType === 'back-to-start') {
              return {
                type: StaticBlockType.TrainPlatform,
              };
            } else {
              throw new Error();
            }
          })(),
          session: this.args.session,
        },
        this.dependencies,
      ),
    );

    this.scene.stop(this.scene.key);

    this.scene.start(sceneKey);

    return 'ok';
  }
}

// TODO: remove previous scene assets and scene instance to avoid memory leaks

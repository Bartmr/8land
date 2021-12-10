import { throwError } from '@app/shared/internals/utils/throw-error';
import { HotReloadClass } from 'src/logic/app-internals/utils/hot-reload-class';
import { TILE_SIZE } from './game-constants';
import { GridControls } from './grid-controls';
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
import { getLandById } from './mocks';
import { MusicProvider } from './music-provider.types';
import { Player } from './player';
import { TiledJSON } from './tiled.types';

@HotReloadClass(module)
export class LandScene extends Phaser.Scene {
  private gridControls?: GridControls;
  private gridPhysics?: GridPhysics;

  protected previousLandSceneArguments: LandSceneArguments | null;
  protected arguments: LandSceneArguments;
  protected dependencies: { musicProvider: MusicProvider };

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
    args: LandScene['arguments'],
    deps: LandScene['dependencies'],
  ) {
    super({
      key: getLandSceneKey(args.land),
      active: false,
      visible: false,
    });

    this.previousLandSceneArguments = previousLandSceneArguments;
    this.arguments = args;
    this.dependencies = deps;
  }

  public create() {
    if (this.previousLandSceneArguments) {
      this.scene.remove(getLandSceneKey(this.previousLandSceneArguments.land));
    }

    // LAND
    const landTiledJSON =
      (
        this.cache.tilemap.get(
          getLandSceneTiledJSONKey(this.arguments.land),
        ) as { data: TiledJSON } | undefined
      )?.data || throwError();

    const landFirstTileset = landTiledJSON.tilesets[0] || throwError();

    const landMap = this.make.tilemap({
      key: getLandSceneTiledJSONKey(this.arguments.land),
    });
    landMap.addTilesetImage(
      landFirstTileset.name,
      getLandSceneTilesetKey(this.arguments.land),
    );

    const landLayer = landMap.createLayer(0, landFirstTileset.name, 0, 0);
    landLayer.setDepth(0);

    this.animatedTiles.init(landMap);
    //

    // PROPERTIES
    const territoryContexts: Array<{
      id: string;
      startX: number;
      startY: number;
      tilemap: Phaser.Tilemaps.Tilemap;
      blocks: Block[];
    }> = [];
    for (let i = 0; i < this.arguments.land.territories.length; i++) {
      const territory = this.arguments.land.territories[i] || throwError();

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
        startY: territory.startY,
        tilemap: territoryMap,
        blocks: territory.blocks,
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

          if (properties.includes(this.arguments.comingFromDoorBlock.id)) {
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

    for (const territoryContext of territoryContexts) {
      for (const layer of territoryContext.tilemap.layers) {
        for (const row of layer.data) {
          for (const tile of row) {
            const properties = Object.keys(
              tile.properties as { [key: string]: unknown },
            ).filter(
              (key) => !!(tile.properties as { [key: string]: unknown })[key],
            );

            if (properties.includes(this.arguments.comingFromDoorBlock.id)) {
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

    const playerSprite = this.add.sprite(0, 0, 'player');
    playerSprite.setDepth(2);

    this.cameras.main.startFollow(playerSprite);
    this.cameras.main.roundPixels = true;
    this.cameras.main.setBounds(0, 0, landLayer.width, landLayer.height);

    if (!position) {
      throw new Error('theres no start block');
    }

    const player = new Player(
      playerSprite,
      new Phaser.Math.Vector2(position.x, position.y),
    );

    this.gridPhysics = new GridPhysics(player, {
      land: {
        id: this.arguments.land.id,
        blocks: this.arguments.land.blocks,
        tilemap: landMap,
      },
      territories: territoryContexts,
      onStepIntoDoor: (block: DoorBlock) => {
        this.handleStepIntoDoor(block);
      },
    });
    this.gridControls = new GridControls(this.input, this.gridPhysics);

    this.createPlayerAnimation(Direction.UP, 9, 8);
    this.createPlayerAnimation(Direction.RIGHT, 1, 0);
    this.createPlayerAnimation(Direction.DOWN, 6, 5);
    this.createPlayerAnimation(Direction.LEFT, 3, 2);
  }

  public update(_time: number, delta: number) {
    (this.gridControls || throwError()).update();
    (this.gridPhysics || throwError()).update(delta);
  }

  public preload() {
    this.load.image(
      getLandSceneTilesetKey(this.arguments.land),
      this.arguments.land.tilesetUrl,
    );
    this.load.tilemapTiledJSON(
      getLandSceneTiledJSONKey(this.arguments.land),
      this.arguments.land.tilemapTiledJSONUrl,
    );

    for (const territory of this.arguments.land.territories) {
      this.load.image(getTerritoryTilesetKey(territory), territory.tilesetUrl);
      this.load.tilemapTiledJSON(
        getTerritoryTiledJSONKey(territory),
        territory.tilemapTiledJSONUrl,
      );
    }

    //

    this.load.spritesheet('player', this.arguments.player.spritesheetUrl, {
      frameWidth: 16,
      frameHeight: 16,
    });

    /*
      From https://github.com/nkholski/phaser-animated-tiles/blob/master/dist/AnimatedTiles.js
      commit a10cc9f on May 26, 2018
    */
    this.load.scenePlugin(
      'AnimatedTiles',
      'AnimatedTiles.js',
      'animatedTiles',
      'animatedTiles',
    );

    this.dependencies.musicProvider.playFromSoundcloud(
      this.arguments.land.backgroundMusicUrl,
    );
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

  private handleStepIntoDoor(block: DoorBlock) {
    let nextLandId: string;

    if (this.arguments.land.id === block.land_a) {
      nextLandId = block.land_b;
    } else if (this.arguments.land.id === block.land_b) {
      nextLandId = block.land_a;
    } else {
      throw new Error();
    }

    if (nextLandId === this.arguments.land.id) {
      // it's the start block
      return;
    }

    const nextLand = getLandById(nextLandId);

    if (!nextLand) {
      // TODO: deal with 404 of lands
      throw new Error();
    }

    const sceneKey = getLandSceneKey(nextLand);

    this.scene.add(
      sceneKey,
      new LandScene(
        this.arguments,
        {
          player: this.arguments.player,
          land: nextLand,
          lastBaseLandDoorBlock: nextLand.isBaseLand ? null : block,
          comingFromDoorBlock: block,
        },
        {
          musicProvider: this.dependencies.musicProvider,
        },
      ),
    );

    this.scene.stop(this.scene.key);

    this.scene.start(sceneKey);
  }
}

// TODO: remove previous scene assets and scene instance to avoid memory leaks

import { throwError } from '@app/shared/internals/utils/throw-error';
import { GetLandDTO } from '@app/shared/land/get/get-land.dto';
import { createTiledJSONSchema } from '@app/shared/land/upload-assets/upload-land-assets.schemas';
import { InferType } from 'not-me/lib/schemas/schema';
import { useEffect, useState } from 'react';
import { TILE_SIZE } from 'src/components/templates/client-side/index/game-constants';
import { TiledJSON } from 'src/components/templates/client-side/index/tiled.types';
import { useJSONHttp } from 'src/logic/app-internals/transports/http/json/use-json-http';
import { TransportFailure } from 'src/logic/app-internals/transports/transported-data/transport-failures';
import {
  TransportedData,
  TransportedDataStatus,
} from 'src/logic/app-internals/transports/transported-data/transported-data-types';
import { v4 } from 'uuid';

export function TerritoryPreview(props: {
  land: GetLandDTO;
  intervals: Array<{
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  }>;
  pendingInterval?: {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  };
}) {
  const jsonHttp = useJSONHttp();

  const [scene, replaceScene] = useState<TransportedData<Phaser.Scene>>({
    status: TransportedDataStatus.NotInitialized,
  });
  const [previousRectangles] = useState<Phaser.GameObjects.Rectangle[]>([]);

  useEffect(() => {
    let _game: Phaser.Game;

    (async () => {
      const map = await jsonHttp.get<{
        status: 200;
        body: InferType<ReturnType<typeof createTiledJSONSchema>>;
      }>({
        url: `${(props.land.assets || throwError()).baseUrl}/${
          (props.land.assets || throwError()).mapKey
        }`,
        acceptableStatusCodes: [200],
      });

      if (map.failure) {
        replaceScene({ status: map.failure });
        return;
      }

      try {
        const Phaser = await import('phaser');

        const gameConfig: Phaser.Types.Core.GameConfig = {
          title: 'Land Preview',
          render: {
            antialias: false,
          },
          pixelArt: true,
          type: Phaser.AUTO,
          scale: {
            width: map.response.body.width * TILE_SIZE,
            height: map.response.body.height * TILE_SIZE,
            mode: Phaser.Scale.WIDTH_CONTROLS_HEIGHT,
            autoCenter: Phaser.Scale.Center.CENTER_HORIZONTALLY,
          },
          parent: 'preview-root',
          backgroundColor: '#000000',
          canvasStyle:
            'border-color: var(--body-contrasting-color); border-width: 3px; border-style: solid;',
        };

        _game = new Phaser.Game(gameConfig);
      } catch (err) {
        replaceScene({ status: TransportFailure.ConnectionFailure });
        return;
      }

      const sceneKey = v4();

      class PreviewScene extends Phaser.Scene {
        preload() {
          this.load.setBaseURL(
            `${(props.land.assets || throwError()).baseUrl}/`,
          );
          this.load.image(
            `${sceneKey}-tileset`,
            (props.land.assets || throwError()).tilesetKey,
          );
          this.load.tilemapTiledJSON(
            `${sceneKey}-map`,
            (props.land.assets || throwError()).mapKey,
          );
        }
        create() {
          replaceScene({
            status: TransportedDataStatus.Done,
            data: this,
          });

          const landTiledJSON =
            (
              this.cache.tilemap.get(`${sceneKey}-map`) as
                | { data: TiledJSON }
                | undefined
            )?.data || throwError();

          const landFirstTileset = landTiledJSON.tilesets[0] || throwError();

          const landMap = this.make.tilemap({
            key: `${sceneKey}-map`,
          });
          landMap.addTilesetImage(landFirstTileset.name, `${sceneKey}-tileset`);

          const landLayer = landMap.createLayer(0, landFirstTileset.name, 0, 0);
          landLayer.setDepth(0);
        }
      }

      _game.scene.add(
        sceneKey,
        new PreviewScene({
          key: sceneKey,
          active: false,
          visible: false,
        }),
      );

      _game.scene.start(sceneKey);
    })();

    return () => {
      _game.destroy(true);
    };
  }, []);

  useEffect(() => {
    if (scene.data) {
      const _scene = scene.data;

      for (const previousRectangle of previousRectangles) {
        _scene.children.remove(previousRectangle);
      }

      for (const interval of props.intervals) {
        const rectangle = _scene.add.rectangle(
          interval.startX * TILE_SIZE,
          interval.startY * TILE_SIZE,
          (interval.endX - interval.startX) * TILE_SIZE,
          (interval.endY - interval.startY) * TILE_SIZE,
          0xff0000,
          0.8,
        );

        rectangle.setStrokeStyle(1, 0xffffff);

        rectangle.setBlendMode(Phaser.BlendModes.MULTIPLY);

        previousRectangles.push(rectangle);
      }
    }
  }, [
    scene,
    JSON.stringify({
      intervals: props.intervals,
      pendingInterval: props.pendingInterval,
    }),
  ]);

  return (
    <div>
      <div id="preview-root"></div>
    </div>
  );
}

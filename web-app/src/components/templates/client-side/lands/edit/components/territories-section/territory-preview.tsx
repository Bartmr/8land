import { throwError } from '@app/shared/internals/utils/throw-error';
import { GetLandDTO } from '@app/shared/land/get/get-land.dto';
import { createTiledJSONSchema } from '@app/shared/land/upload-assets/upload-land-assets.schemas';
import { InferType } from 'not-me/lib/schemas/schema';
import { useEffect, useState } from 'react';
import { TiledJSON } from 'src/components/templates/client-side/index/components/components/screens/land/tiled.types';
import { TILE_SIZE } from 'src/components/templates/client-side/index/game-constants';
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
  maxHeight?: string;
  onScreenshotTaken?: (blob: Blob) => void;
}) {
  const jsonHttp = useJSONHttp();

  const [previewFrame, replacePreviewFrame] = useState<
    TransportedData<{
      scene: Phaser.Scene;
      game: Phaser.Game;
    }>
  >({
    status: TransportedDataStatus.NotInitialized,
  });
  const [previousRectangles] = useState<Phaser.GameObjects.Rectangle[]>([]);
  const [pendingIntervalRectangle, replacePendingIntervalRectangle] =
    useState<Phaser.GameObjects.Rectangle>();

  const [elementId] = useState(v4());

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
        replacePreviewFrame({ status: map.failure });
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
            mode: props.onScreenshotTaken
              ? Phaser.Scale.ZOOM_2X
              : Phaser.Scale.WIDTH_CONTROLS_HEIGHT,
            autoCenter: Phaser.Scale.Center.CENTER_HORIZONTALLY,
          },
          parent: elementId,
          backgroundColor: '#000000',
          canvasStyle:
            'border-color: var(--body-contrasting-color); border-width: 3px; border-style: solid;',
        };

        _game = new Phaser.Game(gameConfig);
      } catch (err) {
        replacePreviewFrame({ status: TransportFailure.ConnectionFailure });
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

          setTimeout(() => {
            replacePreviewFrame({
              status: TransportedDataStatus.Done,
              data: { scene: this, game: _game },
            });
          }, 1000);
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
    if (previewFrame.data) {
      const _scene = previewFrame.data.scene;
      const _game = previewFrame.data.game;

      for (const previousRectangle of previousRectangles) {
        _scene.children.remove(previousRectangle);
      }

      if (pendingIntervalRectangle) {
        _scene.children.remove(pendingIntervalRectangle);
        replacePendingIntervalRectangle(undefined);
      }

      for (const interval of props.intervals) {
        const rectangle = _scene.add.rectangle(
          interval.startX * TILE_SIZE,
          interval.startY * TILE_SIZE,
          (interval.endX - interval.startX) * TILE_SIZE,
          (interval.endY - interval.startY) * TILE_SIZE,
          0xff0000,
          0.6,
        );

        rectangle.displayOriginX = 0;
        rectangle.displayOriginY = 0;

        rectangle.setStrokeStyle(1, 0xffffff);

        previousRectangles.push(rectangle);
      }

      if (props.pendingInterval) {
        const _pendingIntervalRectangle = _scene.add.rectangle(
          props.pendingInterval.startX * TILE_SIZE,
          props.pendingInterval.startY * TILE_SIZE,
          (props.pendingInterval.endX - props.pendingInterval.startX) *
            TILE_SIZE,
          (props.pendingInterval.endY - props.pendingInterval.startY) *
            TILE_SIZE,
          0x00ff00,
          0.6,
        );

        _pendingIntervalRectangle.displayOriginX = 0;
        _pendingIntervalRectangle.displayOriginY = 0;

        _pendingIntervalRectangle.setStrokeStyle(1, 0xffffff);

        replacePendingIntervalRectangle(_pendingIntervalRectangle);
      }

      if (props.onScreenshotTaken) {
        setTimeout(() => {
          _game.canvas.toBlob(
            (blob) => {
              if (!blob) {
                throw new Error();
              }

              if (!props.onScreenshotTaken) {
                throw new Error();
              }

              props.onScreenshotTaken(blob);
            },
            'image/png',
            1,
          );
        }, 1000);
      }
    }
  }, [
    previewFrame,
    JSON.stringify({
      intervals: props.intervals,
      pendingInterval: props.pendingInterval,
    }),
  ]);

  return (
    <div>
      <div id={elementId}></div>
    </div>
  );
}

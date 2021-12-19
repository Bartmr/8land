import { Layout } from 'src/components/routing/layout/layout';
import { CREATE_LAND_ROUTE } from './create-land-routes';
import { RouteComponentProps } from '@reach/router';
import { useState, useEffect } from 'react';
import { object } from 'not-me/lib/schemas/object/object-schema';
import { number } from 'not-me/lib/schemas/number/number-schema';
import { boolean } from 'not-me/lib/schemas/boolean/boolean-schema';
import { array } from 'not-me/lib/schemas/array/array-schema';
import { string } from 'not-me/lib/schemas/string/string-schema';
import { equals } from 'not-me/lib/schemas/equals/equals-schema';
import { or } from 'not-me/lib/schemas/or/or-schema';
import { InferType } from 'not-me/lib/schemas/schema';
import { AnyErrorMessagesTree } from 'not-me/lib/error-messages/error-messages-tree';
import {
  TransportedData,
  TransportedDataStatus,
} from 'src/logic/app-internals/transports/transported-data/transported-data-types';
import { TransportedDataGate } from 'src/components/shared/transported-data-gate/transported-data-gate';

const tiledJSONSchema = object({
  height: number()
    .integer()
    .required()
    .test((h) =>
      h > 0 && h < 41 ? null : 'height must be greater than 0 and less than 41',
    ),
  infinite: boolean()
    .required()
    .test((i) => (i ? 'infinite must be false' : null)),
  layers: array(
    object({
      data: array(number().required()).required(),
      height: number().integer().required(),
      id: number().integer().required(),
      name: string().filled(),
      opacity: number().required(),
      type: equals(['tilelayer']).required(),
      visible: equals([true], 'Must be set to true'),
      width: number().integer().required(),
      x: equals([0], 'Must be set to 0').required(),
      y: equals([0], 'Must be set to 0').required(),
    }).required(),
  )
    .min(0, 'You must have at least one tileset')
    .max(1, 'You cannot have more than one layer')
    .required(),
  nextlayerid: number().integer().required(),
  nextobjectid: number().integer().required(),
  orientation: equals(['orthogonal'], "must be set to 'orthogonal'").required(),
  renderorder: equals(['right-down'], "must be set to 'right-down'").required(),
  tiledversion: string().required(),
  tileheight: equals([16], 'Must be set to 16').required(),
  tilesets: array(
    object({
      columns: number().integer(),
      firstgid: number().integer().required(),
      image: string().filled(),
      imageheight: number().integer().required(),
      imagewidth: number().integer().required(),
      margin: number().integer().required(),
      name: string().filled(),
      spacing: number().integer().required(),
      tilecount: number().integer().required(),
      tileheight: equals([16], 'Must be set to 16').required(),
      tiles: array(
        object({
          id: number().integer().required(),
          properties: array(
            or([
              object({
                animation: equals([]).notNull(),
                name: string().filled(),
                type: equals(
                  ['bool'],
                  'Only boolean tile properties are allowed',
                ).required(),
                value: boolean().required(),
              }).required(),
              object({
                animation: array(
                  object({
                    duration: number().integer().required(),
                    tileid: number().integer().required(),
                  }).required(),
                ).required(),
              }).required(),
            ]).required(),
          ).required(),
        }).required(),
      ).required(),
    }).required(),
  )
    .min(0, 'You must have at least one tileset')
    .max(1, 'You cannot have more than one tileset')
    .required(),
  tilewidth: equals([16], 'Must be set to 16').required(),
  type: equals(['map'], "Must be set to 'map'").required(),
  version: string().filled(),
  width: number()
    .integer()
    .required()
    .test((w) =>
      w > 0 && w < 41 ? null : 'width must be greater than 0 and less than 41',
    ),
})
  .required()
  .test((o) => {
    for (const layer of o.layers) {
      if (layer.height > o.height) {
        return 'Layer height should not exceed map height';
      }

      if (layer.width > o.width) {
        return 'Layer width should not exceed map width';
      }
    }

    for (const tileset of o.tilesets) {
      for (const tile of tileset.tiles) {
        for (const property of tile.properties) {
          if (property.animation) {
            for (const animation of property.animation) {
              if (animation.tileid > tileset.tilecount) {
                return `${animation.tileid} is bigger than the total tiles in the tileset`;
              }
            }
          }
        }
      }
    }

    return null;
  });

export function CreateLandTemplate(_props: RouteComponentProps) {
  // raw file, without any validation
  const [file, replaceFile] = useState<undefined | File>(undefined);
  const [incompatibleFileFormat, replaceIncompatibleFileFormat] = useState<
    undefined | 'incompatible-file-format' | 'file-size-exceeded'
  >(undefined);
  const [fileValidationErrors, replaceFileJSONValidationErrors] = useState<
    AnyErrorMessagesTree | undefined
  >(undefined);
  // Final value. Exists if valid
  const [fileJSON, replaceFileJSON] = useState<
    undefined | InferType<typeof tiledJSONSchema>
  >(undefined);

  //
  //

  // Check if incompatibleTilesetFileFormat is empty before submitting
  const [tilesetFile, replaceTilesetFile] = useState<undefined | File>(
    undefined,
  );
  const [incompatibleTilesetFileFormat, replaceIncompatibleTilesetFileFormat] =
    useState<undefined | 'wrong-file-format' | 'file-size-exceeded'>(undefined);

  //
  //

  const [formSubmissionStatus, replaceFormSubmissionStatus] = useState<
    TransportedData<undefined>
  >({ status: TransportedDataStatus.NotInitialized });

  useEffect(() => {
    (async () => {
      replaceFileJSONValidationErrors(undefined);
      replaceIncompatibleFileFormat(undefined);
      replaceFileJSON(undefined);

      if (file) {
        let parsedFile;

        try {
          if (
            !(file.name.endsWith('.json') && file.type === 'application/json')
          ) {
            throw new Error('incompatible-file-format');
          }

          if (file.size > 512000) {
            throw new Error('file-size-exceeded');
          }

          const text = await file.text();

          parsedFile = JSON.parse(text) as unknown;

          replaceIncompatibleFileFormat(undefined);

          const validationResult = tiledJSONSchema.validate(parsedFile);

          if (validationResult.errors) {
            replaceFileJSONValidationErrors(validationResult.messagesTree);
          } else {
            replaceFileJSONValidationErrors(undefined);
            replaceFileJSON(validationResult.value);
          }
        } catch (err) {
          if (err instanceof Error && err.message === 'file-size-exceeded') {
            replaceIncompatibleFileFormat('file-size-exceeded');
            return;
          }

          replaceIncompatibleFileFormat('incompatible-file-format');
          return;
        }
      }
    })();
  }, [file]);

  useEffect(() => {
    (async () => {
      replaceIncompatibleTilesetFileFormat(undefined);

      if (tilesetFile && fileJSON) {
        if (
          !(
            tilesetFile.name.endsWith('.png') &&
            tilesetFile.type === 'image/png'
          )
        ) {
          replaceIncompatibleTilesetFileFormat('wrong-file-format');
          return;
        }

        if (tilesetFile.size > 512000) {
          replaceIncompatibleTilesetFileFormat('file-size-exceeded');
          return;
        }
      }
    })();
  }, [tilesetFile, fileJSON]);

  return (
    <Layout title={CREATE_LAND_ROUTE.label}>
      {() => {
        return (
          <>
            <h2>Map and Graphics</h2>
            <div className="card">
              <div className="card-body">
                <div className="mb-3">
                  <label htmlFor="map-input" className="form-label">
                    Tiled map JSON file
                  </label>
                  <input
                    onChange={(e) => {
                      const files = e.target.files;

                      replaceFile(files ? files[0] : undefined);
                    }}
                    className={`form-control ${
                      incompatibleFileFormat || fileValidationErrors
                        ? 'is-invalid'
                        : ''
                    }`}
                    type="file"
                    id="map-input"
                  />
                  {incompatibleFileFormat ? (
                    <div className="invalid-feedback">
                      {incompatibleFileFormat === 'incompatible-file-format'
                        ? "Incompatible file format. Make sure you're uploading a JSON Tiled file"
                        : 'File size cannot exceed 512k'}
                    </div>
                  ) : null}
                  {fileValidationErrors ? (
                    <>
                      <div className="invalid-feedback">
                        Some invalid values were found in your Tiled JSON.
                      </div>
                      <div className="card">
                        <div className="card-body text-danger">
                          {JSON.stringify(fileValidationErrors, undefined, 2)}
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>
                {fileJSON ? (
                  <>
                    <hr />
                    <div>
                      <label htmlFor="map-input" className="form-label">
                        Tileset picture in PNG format
                      </label>
                      <input
                        onChange={(e) => {
                          const files = e.target.files;

                          replaceTilesetFile(files ? files[0] : undefined);
                        }}
                        className={`form-control ${
                          incompatibleTilesetFileFormat ? 'is-invalid' : ''
                        }`}
                        type="file"
                        id="map-input"
                      />
                      {incompatibleTilesetFileFormat ? (
                        <div className="invalid-feedback">
                          {incompatibleTilesetFileFormat === 'wrong-file-format'
                            ? "Incompatible file format. Make sure you're uploading a PNG image"
                            : 'File size cannot exceed 512k'}
                        </div>
                      ) : null}
                    </div>
                  </>
                ) : null}

                {fileJSON &&
                tilesetFile &&
                incompatibleTilesetFileFormat === undefined ? (
                  <div className="mt-3">
                    <button
                      className="d-block w-100 btn btn-success"
                      disabled={
                        formSubmissionStatus.status ===
                        TransportedDataStatus.Loading
                      }
                      onClick={() => {
                        replaceFormSubmissionStatus({
                          status: TransportedDataStatus.Loading,
                        });
                      }}
                    >
                      Upload
                    </button>
                    <TransportedDataGate
                      className="ms-3"
                      dataWrapper={formSubmissionStatus}
                    >
                      {() => null}
                    </TransportedDataGate>
                  </div>
                ) : null}
              </div>
            </div>
          </>
        );
      }}
    </Layout>
  );
}

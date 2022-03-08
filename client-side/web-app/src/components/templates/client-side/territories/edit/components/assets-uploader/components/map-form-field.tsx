import { createTiledJSONSchema } from '@app/shared/land/upload-assets/upload-land-assets.schemas';
import { TERRITORY_MAP_SIZE_LIMIT } from '@app/shared/territories/edit/edit-territory.constants';
import { GetTerritoryDTO } from '@app/shared/territories/get/get-territory.dto';
import { AnyErrorMessagesTree } from 'not-me/lib/error-messages/error-messages-tree';
import { useState } from 'react';

export function MapFormField(props: {
  territory: GetTerritoryDTO;
  onChange: (file: File | undefined) => void;
}) {
  const [error, replaceError] = useState<
    | {
        error: 'incompatible-file-format';
      }
    | {
        error: 'file-size-exceeded';
      }
    | {
        error: 'invalid-json';
        messageTree: AnyErrorMessagesTree;
      }
    | {
        error: '';
      }
    | undefined
  >();

  return (
    <div>
      <label htmlFor="map-input" className="form-label">
        Tiled map JSON file
      </label>
      <input
        onChange={async (e) => {
          const files = e.target.files;
          const file = files ? files[0] : undefined;

          if (file) {
            if (!file.name.endsWith('.json')) {
              replaceError({ error: 'incompatible-file-format' });
              return;
            }

            if (file.size > TERRITORY_MAP_SIZE_LIMIT) {
              replaceError({ error: 'file-size-exceeded' });
              return;
            }

            const text = await file.text();

            const parsedFile = JSON.parse(text) as unknown;

            const maxWidth = props.territory.endX - props.territory.startX;
            const maxHeight = props.territory.endY - props.territory.startY;

            const schema = createTiledJSONSchema({
              maxWidth,
              maxHeight,
              maxWidthMessage: `Your territory cannot be more than ${maxWidth} squares wide`,
              maxHeightMessage: `Your territory cannot be more than ${maxHeight} squares tall`,
            });

            const validationResult = schema.validate(parsedFile);

            if (validationResult.errors) {
              replaceError({
                error: 'invalid-json',
                messageTree: validationResult.messagesTree,
              });
              return;
            }

            replaceError(undefined);
            props.onChange(file);
          } else {
            replaceError(undefined);
            props.onChange(undefined);
          }
        }}
        className={`form-control ${error ? 'is-invalid' : ''}`}
        type="file"
        id="map-input"
      />
      {error ? (
        <div className="invalid-feedback">
          {error.error === 'incompatible-file-format'
            ? "Incompatible file format. Make sure you're uploading a JSON file"
            : null}

          {error.error === 'file-size-exceeded'
            ? `File size cannot exceed ${TERRITORY_MAP_SIZE_LIMIT / 1000}kb`
            : null}

          {error.error === 'invalid-json' ? (
            <>
              <div className="invalid-feedback">
                Some invalid values were found in your Tiled JSON.
              </div>
              <div className="card">
                <div className="card-body text-danger">
                  <pre>{JSON.stringify(error.messageTree, undefined, 2)}</pre>
                </div>
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

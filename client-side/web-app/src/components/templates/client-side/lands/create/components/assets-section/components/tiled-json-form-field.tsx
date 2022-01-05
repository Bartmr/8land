import { createTiledJSONSchema } from '@app/shared/land/upload-assets/upload-land-assets.schemas';
import { AnyErrorMessagesTree } from 'not-me/lib/error-messages/error-messages-tree';
import { useEffect, useState } from 'react';

const schema = createTiledJSONSchema();

export type TiledJSONFieldState =
  | undefined
  | { error: 'incompatible-file-format' | 'file-size-exceeded' }
  | { error: 'invalid-json'; messageTree: AnyErrorMessagesTree }
  | {
      error: false;
      value: File;
    };

export function TiledJSONField(props: {
  state: TiledJSONFieldState;
  onChange: (value: TiledJSONFieldState) => void;
}) {
  const [file, replaceFile] = useState<undefined | File>(undefined);

  useEffect(() => {
    (async () => {
      if (file) {
        if (
          !(file.name.endsWith('.json') && file.type === 'application/json')
        ) {
          props.onChange({ error: 'incompatible-file-format' });
          return;
        }

        if (file.size > 512000) {
          props.onChange({ error: 'file-size-exceeded' });
          return;
        }

        const text = await file.text();

        const parsedFile = JSON.parse(text) as unknown;

        const validationResult = schema.validate(parsedFile);

        if (validationResult.errors) {
          props.onChange({
            error: 'invalid-json',
            messageTree: validationResult.messagesTree,
          });
        } else {
          props.onChange({ error: false, value: file });
        }
      } else {
        props.onChange(undefined);
      }
    })();
  }, [file]);

  return (
    <>
      <label htmlFor="map-input" className="form-label">
        Tiled map JSON file
      </label>
      <input
        onChange={(e) => {
          const files = e.target.files;

          replaceFile(files ? files[0] : undefined);
        }}
        className={`form-control ${props.state?.error ? 'is-invalid' : ''}`}
        type="file"
        id="map-input"
      />
      {props.state?.error ? (
        <div className="invalid-feedback">
          {props.state.error === 'incompatible-file-format'
            ? "Incompatible file format. Make sure you're uploading a JSON Tiled file"
            : 'File size cannot exceed 512k'}
        </div>
      ) : null}
      {props.state?.error === 'invalid-json' ? (
        <>
          <div className="invalid-feedback">
            Some invalid values were found in your Tiled JSON.
          </div>
          <div className="card">
            <div className="card-body text-danger">
              {JSON.stringify(props.state.messageTree, undefined, 2)}
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}

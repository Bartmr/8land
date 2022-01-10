import { useEffect, useState } from 'react';

export type TilesetImageFieldState =
  | undefined
  | { error: 'incompatible-file-format' | 'file-size-exceeded' }
  | { error: false; value: File };

export function TilesetImageFormField(props: {
  state: TilesetImageFieldState;
  onChange: (value: TilesetImageFieldState) => void;
}) {
  const [file, replaceFile] = useState<undefined | File>(undefined);

  useEffect(() => {
    (async () => {
      if (file) {
        if (!(file.name.endsWith('.png') && file.type === 'image/png')) {
          props.onChange({ error: 'incompatible-file-format' });
          return;
        }

        if (file.size > 64000) {
          props.onChange({ error: 'file-size-exceeded' });
          return;
        }

        props.onChange({ error: false, value: file });
      } else {
        props.onChange(undefined);
      }
    })();
  }, [file]);

  return (
    <>
      <hr />
      <div>
        <label htmlFor="map-input" className="form-label">
          Tileset picture in PNG format
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
              ? "Incompatible file format. Make sure you're uploading a PNG image"
              : 'File size cannot exceed 512k'}
          </div>
        ) : null}
      </div>
    </>
  );
}

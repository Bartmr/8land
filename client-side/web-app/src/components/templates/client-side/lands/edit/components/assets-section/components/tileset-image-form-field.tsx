import { LAND_TILESET_SIZE_LIMIT } from '@app/shared/land/upload-assets/upload-land-assets.constants';
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
          id="tileset-input"
          accept=".png,image/png"
        />
        <div className="invalid-feedback">
          {props.state?.error === 'file-size-exceeded' ? (
            <span>
              File size cannot exceed {LAND_TILESET_SIZE_LIMIT / 1000} KB. You
              can reduce the file size by converting the tileset to a lower
              color bit-depth or to an indexed color palette.
            </span>
          ) : null}

          {props.state?.error === 'incompatible-file-format'
            ? "Incompatible file format. Make sure you're uploading a PNG image"
            : null}
        </div>
      </div>
    </>
  );
}

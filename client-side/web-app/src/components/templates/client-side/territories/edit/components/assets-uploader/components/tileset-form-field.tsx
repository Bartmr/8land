import { TERRITORY_TILESET_SIZE_LIMIT } from '@app/shared/territories/edit/edit-territory.constants';
import { useState } from 'react';

export function TilesetFormField(props: {
  onChange: (file: File | undefined) => void;
}) {
  const [error, replaceError] = useState<
    'incompatible-file-format' | 'file-size-exceeded' | '' | undefined
  >();

  return (
    <div>
      <label htmlFor="map-input" className="form-label">
        Tileset picture in PNG format
      </label>
      <input
        onChange={(e) => {
          const files = e.target.files;
          const file = files ? files[0] : undefined;

          if (file) {
            if (!(file.name.endsWith('.png') && file.type === 'image/png')) {
              replaceError('incompatible-file-format');
              return;
            }

            if (file.size > TERRITORY_TILESET_SIZE_LIMIT) {
              replaceError('file-size-exceeded');
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
        id="tileset-input"
      />
      <div className="invalid-feedback">
        {error === 'incompatible-file-format'
          ? "Incompatible file format. Make sure you're uploading a PNG image"
          : error === 'file-size-exceeded'
          ? `File size cannot exceed ${TERRITORY_TILESET_SIZE_LIMIT / 1000}kb`
          : null}
      </div>
    </div>
  );
}

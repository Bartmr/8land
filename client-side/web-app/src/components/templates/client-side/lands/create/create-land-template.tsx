import { useForm } from 'react-hook-form';
import { Layout } from 'src/components/routing/layout/layout';
import { useFormUtils } from 'src/logic/app-internals/forms/form-utils';
import { CREATE_LAND_ROUTE } from './create-land-routes';
import { RouteComponentProps } from '@reach/router';
import { useState, useEffect } from 'react'
import { object } from 'not-me/lib/schemas/object/object-schema';
import { number } from 'not-me/lib/schemas/number/number-schema';

const tiledJSONSchema = object({
  height: number().integer().test((n) => n == null || (n > 0 && n < 41) ? null : 'height must be greater than 0 and less than 41')
}).required()

export function CreateLandTemplate(_props: RouteComponentProps) {
  const form = useForm();
  const formUtils = useFormUtils(form);

  const [file, replaceFile] = useState <undefined | File>(undefined)
  const [incompatibleFileFormat, replaceIncompatibleFileFormat] = useState(false);

  useEffect(() => {
    (async () => {
      if(file) {
        let parsedFile;

        try {
          const text = await file.text()
  
          parsedFile = JSON.parse(text)
          
          replaceIncompatibleFileFormat(false);
        } catch (err) {
          replaceIncompatibleFileFormat(true);
          return;
        }
      } else {
        replaceIncompatibleFileFormat(false);
      }
    })()
  }, [file])

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
                  <input onChange={(e) => {
                    const files = e.target.files

                    replaceFile(files ? files[0] : undefined)
                  }} className="form-control" type="file" id="map-input" />
                </div>
                <hr />
              </div>
            </div>
          </>
        );
      }}
    </Layout>
  );
}

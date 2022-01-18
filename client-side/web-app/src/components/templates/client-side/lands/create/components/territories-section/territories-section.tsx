import { GetLandDTO } from '@app/shared/land/get/get-land.dto';
import { TerritoryPreview } from './territory-preview';

export function TerritoriesSection(props: { land: GetLandDTO }) {
  return (
    <div>
      <h3>Territories</h3>
      <div className="row justify-content-center">
        <div className="col-6">
          {props.land.assets ? (
            <TerritoryPreview
              land={props.land}
              intervals={[
                {
                  startX: 5,
                  startY: 5,
                  endX: 9,
                  endY: 9,
                },
              ]}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

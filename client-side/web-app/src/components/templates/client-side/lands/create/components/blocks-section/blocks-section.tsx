import { GetLandDTO } from '@app/shared/land/get/get-land.dto';
import { AddBlockSection } from './components/add-block-section';

export function BlocksSection(props: {
  land: GetLandDTO;
  onBlockCreated: () => void;
}) {
  return (
    <>
      <h2>Blocks</h2>
      <div className="card">
        <div className="card-body">
          <h3>Add Block</h3>
          <AddBlockSection
            land={props.land}
            onBlockCreated={props.onBlockCreated}
          />
          <hr />
          <h3>Door Blocks pointing back to this land</h3>
          <ul className="list-group">
            {props.land.doorBlocksReferencing.map((b) => {
              return (
                <li key={b.id} className="list-group-item">
                  Block Code: {b.id}
                  <br />
                  From Land: {b.fromLandName}
                </li>
              );
            })}
          </ul>
          <hr />
          <h3>Door Blocks</h3>
          <ul className="list-group">
            {props.land.doorBlocks.map((b) => {
              return (
                <li key={b.id} className="list-group-item">
                  Block Code: {b.id}
                  <br />
                  Goes to: {b.toLand.name}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );
}

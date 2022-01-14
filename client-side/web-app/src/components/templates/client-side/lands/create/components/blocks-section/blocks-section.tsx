import { GetLandDTO } from '@app/shared/land/get/get-land.dto';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { TransportedDataGate } from 'src/components/shared/transported-data-gate/transported-data-gate';
import { useMainJSONApi } from 'src/logic/app-internals/apis/main/use-main-json-api';
import {
  TransportedData,
  TransportedDataStatus,
} from 'src/logic/app-internals/transports/transported-data/transported-data-types';
import { AddBlockSection } from './components/add-block-section';

export function BlocksSection(props: {
  land: GetLandDTO;
  onBlockCreated: () => void;
  onBlockDeleted: () => void;
}) {
  const api = useMainJSONApi();

  const [deletionState, replaceDeletionState] = useState<
    TransportedData<undefined>
  >({ status: TransportedDataStatus.Done, data: undefined });

  const deleteBlock = async (blockId: string) => {
    replaceDeletionState({ status: TransportedDataStatus.Loading });

    const res = await api.delete<{ status: 204; body: undefined }, undefined>({
      path: `/lands/${props.land.id}/blocks/${blockId}`,
      query: undefined,
      acceptableStatusCodes: [204],
    });

    if (res.failure) {
      replaceDeletionState({ status: res.failure });
    } else {
      replaceDeletionState({
        status: TransportedDataStatus.Done,
        data: undefined,
      });
      props.onBlockDeleted();
    }
  };
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
          <TransportedDataGate dataWrapper={deletionState}>
            {() => {
              return (
                <ul className="list-group">
                  {props.land.doorBlocks.map((b) => {
                    return (
                      <li
                        key={b.id}
                        className="list-group-item d-flex align-items-center"
                      >
                        <div className="flex-fill">
                          Block Code: {b.id}
                          <br />
                          Goes to: {b.toLand.name}
                        </div>
                        <button
                          onClick={async () => {
                            await deleteBlock(b.id);
                          }}
                          className="btn btn-danger"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              );
            }}
          </TransportedDataGate>
        </div>
      </div>
    </>
  );
}

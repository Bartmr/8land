import { DynamicBlockType } from '@app/shared/blocks/block.enums';
import { GetLandDTO } from '@app/shared/land/get/get-land.dto';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { TransportedDataGate } from 'src/components/shared/transported-data-gate/transported-data-gate';
import {
  TransportedData,
  TransportedDataStatus,
} from 'src/logic/app-internals/transports/transported-data/transported-data-types';
import { useBlocksAPI } from 'src/logic/blocks/blocks-api';
import { AddBlockSection } from './components/add-block-section';

export function BlocksSection(props: {
  land: GetLandDTO;
  onBlockCreated: () => void;
  onBlockDeleted: () => void;
}) {
  const api = useBlocksAPI();

  const [deletionState, replaceDeletionState] = useState<
    TransportedData<undefined>
  >({ status: TransportedDataStatus.Done, data: undefined });

  const deleteBlock = async (
    blockType: DynamicBlockType.Door | DynamicBlockType.App,
    blockId: string,
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete this block?
Players who are currently in this land will be teleported back to the train station!`,
    );

    if (!confirmed) {
      return;
    }

    replaceDeletionState({ status: TransportedDataStatus.Loading });

    const res = await api.deleteBlock({ blockType, blockId });

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
          <h3>Door Blocks pointing to this land</h3>
          <ul className="list-group">
            {props.land.doorBlocksReferencing.map((b) => {
              return (
                <li key={b.id} className="list-group-item">
                  Block ID: {DynamicBlockType.Door}:{b.id}
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
                          Block ID: {DynamicBlockType.Door}:{b.id}
                          <br />
                          Goes to: {b.toLand.name}
                        </div>
                        <button
                          onClick={async () => {
                            await deleteBlock(DynamicBlockType.Door, b.id);
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

          <hr />
          <h3>App Blocks</h3>
          <ul className="list-group">
            {props.land.appBlocks.map((b) => {
              return (
                <li
                  key={b.id}
                  className="list-group-item d-flex align-items-center"
                >
                  <div className="flex-fill">
                    Block ID: {DynamicBlockType.App}:{b.id}
                    <br />
                    URL: {b.url}
                  </div>
                  <button
                    onClick={async () => {
                      await deleteBlock(DynamicBlockType.Door, b.id);
                    }}
                    className="btn btn-danger"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );
}

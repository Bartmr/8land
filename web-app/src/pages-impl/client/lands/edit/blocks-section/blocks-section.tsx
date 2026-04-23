import React from 'react';
import { DynamicBlockType } from '../../../../../main-api/routes/blocks/create/create-block.schemas';
import { GetLandDTO } from '../../../../../main-api/routes/lands/lands.dtos';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { TransportedDataGate } from '../../../../../ui/transported-data-gate';
import {
  TransportedData,
  TransportedDataStatus,
} from '../../../../../communicated-data/communicated-data-types';
import { useBlocksAPI } from '../../../../../main-api/routes/blocks/blocks-api';
import { AddBlockSection } from './add-block-section';

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

    if (res.error) {
      replaceDeletionState({ status: res.error });
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
                  Block ID:{' '}
                  <span className="text-highlight">
                    {DynamicBlockType.Door}:{b.id}
                  </span>
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
                          Block ID:{' '}
                          <span className="text-highlight">
                            {DynamicBlockType.Door}:{b.id}
                          </span>
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
                    Block ID:{' '}
                    <span className="text-highlight">
                      {DynamicBlockType.App}:{b.id}
                    </span>
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

import React from 'react';
import { DynamicBlockType } from '../../../../../api/routes/blocks/blocks-api';
import { GetLandDTO } from '../../../../../api/routes/lands/lands-api';
import { FaTrash } from 'react-icons/fa';
import { useState } from 'react';
import { ApiFetchErrors } from '../../../../../api/fetch-errors';
import {
  FaExclamationCircle,
  FaWifi,
} from 'react-icons/fa';
import { useBlocksAPI } from '../../../../../api/routes/blocks/blocks-api';
import { AddBlockSection } from './add-block-section';

export function BlocksSection(props: {
  land: GetLandDTO;
  onBlockCreated: () => void;
  onBlockDeleted: () => void;
}) {
  const api = useBlocksAPI();

  const [deletionState, replaceDeletionState] = useState<{
    loading?: boolean;
    error?: ApiFetchErrors;
  }>({});

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

    replaceDeletionState({ loading: true });

    const res = await api.deleteBlock({ blockType, blockId });

    if (res.error) {
      replaceDeletionState({ error: res.error });
    } else {
      replaceDeletionState({});
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
          <div className=" ">
            {deletionState.loading ? (
              <div className="d-flex flex-column justify-content-center align-items-center">
                <div
                  className="d-block spinner-lg spinner-border text-primary"
                  role="status"
                >
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : null}
            {deletionState.error === ApiFetchErrors.ConnectionFailure ? (
              <div className="d-flex flex-column justify-content-center align-items-center">
                <FaWifi className="text-danger" style={{ fontSize: '2rem' }} />
                <p className="mt-3 text-center text-danger mb-0">
                  No Internet. Check your connection and try again.
                </p>
              </div>
            ) : deletionState.error === ApiFetchErrors.Aborted ? (
              <div className="d-flex flex-column justify-content-center align-items-center">
                <p className="mt-3 text-center mb-0">Redirecting...</p>
              </div>
            ) : deletionState.error === ApiFetchErrors.UnexpectedResponse ? (
              <div className="d-flex flex-column justify-content-center align-items-center">
                <FaExclamationCircle
                  className="text-danger"
                  style={{ fontSize: '2rem' }}
                />
                <p className="text-danger mt-3 text-center mb-0">
                  An unexpected error occurred. Try again later.
                </p>
              </div>
            ) : null}
            {!deletionState.loading && !deletionState.error ? (
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
                        <FaTrash />
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>

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
                    <FaTrash />
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

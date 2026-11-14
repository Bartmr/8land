import React from 'react';
import { DynamicBlockType } from '../../../../../api/routes/blocks/blocks-api';
import { GetLandDTO } from '../../../../../api/routes/lands/lands-api';
import { FaTrash } from 'react-icons/fa';
import { useState } from 'react';
import {
  CommunicatedData,
  CommunicatedDataStatus,
} from '../../../../../communicated-data/communicated-data-types';
import { CommunicationError } from '../../../../../communication-errors/communication-errors';
import {
  FaExclamationCircle,
  FaLock,
  FaSearch,
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

  const [deletionState, replaceDeletionState] = useState<
    CommunicatedData<undefined>
  >({ status: CommunicatedDataStatus.Done, data: undefined });

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

    replaceDeletionState({ status: CommunicatedDataStatus.Loading });

    const res = await api.deleteBlock({ blockType, blockId });

    if (res.error) {
      replaceDeletionState({ status: res.error });
    } else {
      replaceDeletionState({
        status: CommunicatedDataStatus.Done,
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
          <div className=" ">
            {deletionState.status === CommunicatedDataStatus.NotInitialized ? null : deletionState.status === CommunicatedDataStatus.Loading ? (
              <div className="d-flex flex-column justify-content-center align-items-center">
                <div
                  className="d-block spinner-lg spinner-border text-primary"
                  role="status"
                >
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : deletionState.status === CommunicatedDataStatus.Refreshing ? (
              <div
                style={{
                  zIndex: 1,
                  right: 'var(--spacer-3)',
                  position: 'fixed',
                }}
              >
                <div
                  className="d-block spinner-lg spinner-border text-primary"
                  role="status"
                >
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : deletionState.status === CommunicationError.NotFound ? (
              <div className="d-flex flex-column justify-content-center align-items-center">
                <FaSearch style={{ fontSize: '2rem' }} />
                <p className="mt-3 text-center mb-0">Not Found</p>
              </div>
            ) : deletionState.status === CommunicationError.ConnectionFailure ? (
              <div className="d-flex flex-column justify-content-center align-items-center">
                <FaWifi className="text-danger" style={{ fontSize: '2rem' }} />
                <p className="mt-3 text-center text-danger mb-0">
                  No Internet. Check your connection and try again.
                </p>
              </div>
            ) : deletionState.status === CommunicationError.Forbidden ? (
              <div className="d-flex flex-column justify-content-center align-items-center">
                <FaLock style={{ fontSize: '2rem' }} />
                <p className="mt-3 text-center mb-0">
                  You are not allowed to access this content
                </p>
              </div>
            ) : deletionState.status === CommunicationError.AbortedAndDealtWith ? (
              <div className="d-flex flex-column justify-content-center align-items-center">
                <p className="mt-3 text-center mb-0">Redirecting...</p>
              </div>
            ) : deletionState.status === CommunicationError.UnexpectedResponse ? (
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
            {deletionState.status === CommunicatedDataStatus.Done ||
            deletionState.status === CommunicatedDataStatus.Refreshing ? (
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

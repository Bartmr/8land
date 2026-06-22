import { FaExclamationCircle, FaLock, FaSearch, FaWifi } from 'react-icons/fa';
import React, { ReactNode } from 'react';
import { Logger } from '../logging/logger';
import { CommunicationError } from '../communication-errors/communication-errors';
import {
  CommunicatedData,
  CommunicatedDataStatus,
  UnwrapCommunicatedData,
} from '../communicated-data/communicated-data-types';

export enum CommunicatedDataGateLayout {
  Tape = 'tape',
  Default = 'default',
  Small = 'small',
}

type Props<T extends CommunicatedData<unknown>> = {
  layout?: CommunicatedDataGateLayout;
  dataWrapper: T;
  className?: string;
  children: (props: { data: UnwrapCommunicatedData<T> }) => ReactNode;
  loadingMessage?: string;
};

export function CommunicatedDataGate<T extends CommunicatedData<unknown>>({
  children,
  dataWrapper,
  layout = CommunicatedDataGateLayout.Default,
  className,
  loadingMessage,
}: Props<T>) {
  const flexClassName = `d-flex ${
    layout === CommunicatedDataGateLayout.Tape
      ? 'flex-row justify-content-center align-items-center'
      : 'flex-column justify-content-center align-items-center'
  }`;

  const spinnerSizeClass =
    layout === CommunicatedDataGateLayout.Default ? 'spinner-lg' : 'spinner-sm';

  const iconSizeStyle =
    layout === CommunicatedDataGateLayout.Default ? { fontSize: '2rem'} : {};
  const textClassName =
    layout === CommunicatedDataGateLayout.Tape
      ? 'ms-2'
      : layout === CommunicatedDataGateLayout.Small
      ? 'small mt-2 text-center'
      : 'mt-3 text-center';

  let gateStatusUI: ReactNode;

  if (dataWrapper.status === CommunicatedDataStatus.NotInitialized) {
    gateStatusUI = null;
  } else if (dataWrapper.status === CommunicatedDataStatus.Loading) {
    gateStatusUI = (
      <div className={flexClassName}>
        <div
          className={`d-block ${spinnerSizeClass} spinner-border text-primary`}
          role="status"
        >
          <span className="visually-hidden">Loading...</span>
        </div>
        {loadingMessage ? (
          <p className={`${textClassName} text-primary mb-0`}>
            {loadingMessage}
          </p>
        ) : null}
      </div>
    );
  } else if (dataWrapper.status === CommunicatedDataStatus.Refreshing) {
    gateStatusUI = (
      <div
        className={`${
          layout === CommunicatedDataGateLayout.Small ? 'drop-shadow-sm' : ''
        }`}
        style={
          layout === CommunicatedDataGateLayout.Tape
            ? {
                marginRight: 'var(--spacer-2)',
              }
            : layout === CommunicatedDataGateLayout.Small
            ? {
                zIndex: 1,
                padding: 'var(--spacer-2)',
                position: 'absolute',
              }
            : {
                zIndex: 1,
                right: 'var(--spacer-3)',
                position: 'fixed',
              }
        }
      >
        <div
          className={`d-block ${spinnerSizeClass} spinner-border text-primary`}
          role="status"
        >
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  } else if (dataWrapper.status === CommunicatedDataStatus.Done) {
    gateStatusUI = null;
  } else if (dataWrapper.status === CommunicationError.NotFound) {
    gateStatusUI = (
      <div className={flexClassName}>
        <FaSearch style={iconSizeStyle} />
        <p className={`${textClassName} mb-0`}>Not Found</p>
      </div>
    );
  } else if (dataWrapper.status === CommunicationError.ConnectionFailure) {
    gateStatusUI = (
      <div className={flexClassName}>
        <FaWifi className={`text-danger`} style={iconSizeStyle} />
        <p className={`${textClassName} text-danger mb-0`}>
          No Internet
          {layout === CommunicatedDataGateLayout.Default
            ? '. Check your connection and try again.'
            : null}
        </p>
      </div>
    );
  } else if (dataWrapper.status === CommunicationError.Forbidden) {
    gateStatusUI = (
      <div className={flexClassName}>
        <FaLock style={iconSizeStyle} />
        <p className={`${textClassName} mb-0`}>
          {layout === CommunicatedDataGateLayout.Default
            ? 'You are not allowed to access this content'
            : 'Not Allowed'}
        </p>
      </div>
    );
  } else if (dataWrapper.status === CommunicationError.AbortedAndDealtWith) {
    gateStatusUI = (
      <div className={flexClassName}>
        <p className={`${textClassName} mb-0`}>Redirecting...</p>
      </div>
    );
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  } else if (dataWrapper.status === CommunicationError.UnexpectedResponse) {
    gateStatusUI = (
      <div className={flexClassName}>
        <FaExclamationCircle className={`text-danger`} style={iconSizeStyle} />
        <p className={`text-danger ${textClassName} mb-0`}>
          {layout === CommunicatedDataGateLayout.Default
            ? 'An unexpected error occurred. Try again later.'
            : 'Unexpected Error'}
        </p>
      </div>
    );
  } else {
    Logger.logError(
      'unknown-transported-data-status-in-transported-data-gate',
      new Error(),
      {
        dataStatus: (dataWrapper as CommunicatedData<T>).status,
      },
    );

    gateStatusUI = null;
  }

  const gateContent =
    dataWrapper.status === CommunicatedDataStatus.Done ||
    dataWrapper.status === CommunicatedDataStatus.Refreshing
      ? children({ data: dataWrapper.data as UnwrapCommunicatedData<T> })
      : null;

  return (
    <div
      className={`${
        layout === CommunicatedDataGateLayout.Tape &&
        dataWrapper.status === CommunicatedDataStatus.Refreshing
          ? 'd-flex flex-row align-items-center'
          : ''
      } ${className || ''}`}
    >
      <>{gateStatusUI}</>
      <>{gateContent}</>
    </div>
  );
}

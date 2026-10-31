import { CommunicationError } from '../communication-errors/communication-errors';

export enum CommunicatedDataStatus {
  NotInitialized = 'not-initialized',
  // Loading is for data that is not available or should not be used when loading or updating
  Loading = 'loading',
  Done = 'done',
  // Refreshing is for data that can still be used while it's being updated
  Refreshing = 'refreshing',
  //
  // Errors related to a connection failure are tagged using CommunicationError enum
}

export type CommunicatedData<Data> = Readonly<
  | {
      status: CommunicatedDataStatus.NotInitialized;
      data?: undefined;
    }
  | {
      status: CommunicatedDataStatus.Loading;
      data?: undefined;
    }
  | {
      status: CommunicatedDataStatus.Done;
      data: Data;
    }
  | {
      status: CommunicatedDataStatus.Refreshing;
      data: Data;
    }
  | {
      status: CommunicationError;
      data?: Data;
    }
>;

export type UnwrapCommunicatedData<T extends CommunicatedData<unknown>> =
  T extends {
    status: CommunicatedDataStatus.Done;
    data: infer U;
  }
    ? U
    : /*
    Discard all other TransportedData states
    that may not have any data
  */
      never;

export enum TransportFailure {
  ConnectionFailure = 'connection-failure',
  UnexpectedResponse = 'unexpected-response',
  AbortedAndDealtWith = 'aborted-and-dealt-with',
  Forbidden = 'forbidden',
  NotFound = 'not-found',
}

export const TRANSPORT_FAILURE_VALUES = [
  TransportFailure.ConnectionFailure,
  TransportFailure.UnexpectedResponse,
  TransportFailure.AbortedAndDealtWith,
  TransportFailure.Forbidden,
  TransportFailure.NotFound
]
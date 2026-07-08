export enum CommunicationError {
  ConnectionFailure = 'connection-failure',
  UnexpectedResponse = 'unexpected-response',
  AbortedAndDealtWith = 'aborted-and-dealt-with',
  Forbidden = 'forbidden',
  NotFound = 'not-found',
}

export const COMMUNICATION_ERROR_VALUES = [
  CommunicationError.ConnectionFailure,
  CommunicationError.UnexpectedResponse,
  CommunicationError.AbortedAndDealtWith,
  CommunicationError.Forbidden,
  CommunicationError.NotFound
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isCommunicationError(t: any): t is CommunicationError {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
  return COMMUNICATION_ERROR_VALUES.includes(t);
}
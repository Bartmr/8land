export enum CommunicationError {
  ConnectionFailure = 'connection-failure',
  UnexpectedResponse = 'unexpected-response',
  AbortedAndDealtWith = 'aborted-and-dealt-with',
}

export const COMMUNICATION_ERROR_VALUES = [
  CommunicationError.ConnectionFailure,
  CommunicationError.UnexpectedResponse,
  CommunicationError.AbortedAndDealtWith
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isCommunicationError(t: any): t is CommunicationError {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
  return COMMUNICATION_ERROR_VALUES.includes(t);
}
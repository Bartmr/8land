export enum ApiFetchErrors {
  ConnectionFailure = 'connection-failure',
  UnexpectedResponse = 'unexpected-response',
  AbortedAndDealtWith = 'aborted-and-dealt-with',
}

export const API_FETCH_ERROR_VALUES = [
  ApiFetchErrors.ConnectionFailure,
  ApiFetchErrors.UnexpectedResponse,
  ApiFetchErrors.AbortedAndDealtWith
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isApiFetchErrors(t: any): t is ApiFetchErrors {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
  return API_FETCH_ERROR_VALUES.includes(t);
}
import { TRANSPORT_FAILURE_VALUES, TransportFailure } from './transport-failures';


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isTransportFailure(t: any): t is TransportFailure {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
  return TRANSPORT_FAILURE_VALUES.includes(t);
}

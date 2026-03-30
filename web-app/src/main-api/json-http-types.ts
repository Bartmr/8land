import { CommunicationError } from '../communication-errors/communication-errors';

export type JsonHttpResponseBase = {
  status: number;
  body: unknown;
};

export type JsonHttpResponse<R> =
  | {
      failure?: undefined;
      logAndReturnAsUnexpected: () => {
        failure: CommunicationError.UnexpectedResponse;
        status: number;
      };
      response: R;
      headers: Headers;
    }
  | {
      failure: Exclude<CommunicationError, CommunicationError.UnexpectedResponse>;
    }
  | {
      failure: CommunicationError.UnexpectedResponse;
      status: number;
    };

export type JsonHttpHEADResponse = JsonHttpResponse<{
  status: number;
  body: undefined;
}>;

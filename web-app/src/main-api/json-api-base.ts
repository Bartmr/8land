import { CommunicationError } from 'src/communication-errors/communication-errors';
import { UnparsedRequestHeaders } from './http-types';
import {
  JsonHttpResponse,
  JsonHttpResponseBase,
} from './json-http-types';
import { useJSONHttp } from './use-json-http';




export abstract class JSONApiBase {
  private jsonHttp: ReturnType<typeof useJSONHttp>;
  private apiUrl: string;
  private getHeaders: () => UnparsedRequestHeaders;
  private onInvalidAuthToken: null | (() => Promise<void>);

  constructor(params: {
    jsonHttp: JSONApiBase['jsonHttp'];
    apiUrl: JSONApiBase['apiUrl'];
    getHeaders: JSONApiBase['getHeaders'];
    onInvalidAuthToken: JSONApiBase['onInvalidAuthToken'];
  }) {
    this.jsonHttp = params.jsonHttp;
    this.apiUrl = params.apiUrl;
    this.getHeaders = params.getHeaders;
    this.onInvalidAuthToken = params.onInvalidAuthToken;
  }

  private async doRequest<R extends JsonHttpResponseBase>(
    params:
      | {
          method: 'get' | 'delete' | 'head';
          path: string;
          query: URLSearchParams | undefined;
          acceptableStatusCodes: readonly R['status'][];
        }
      | {
          method: 'post' | 'put' | 'patch';
          path: string;
          query: URLSearchParams | undefined;
          body: unknown;
          acceptableStatusCodes: readonly R['status'][];
        },
  ): Promise<JsonHttpResponse<R>> {
    const originallyAcceptableStatusCodes = params.acceptableStatusCodes;

    const transformedRequestParams = {
      headers: {
        ...this.getHeaders(),
      },
      acceptableStatusCodes: [
        ...originallyAcceptableStatusCodes,
        401,
        403,
        404,
      ],
      url: `${this.apiUrl}${params.path}${
        params.query ? `?${params.query.toString()}` : ''
      }`,
      withCredentials: true,
    };

    const res = await (() => {
      if (
        params.method === 'post' ||
        params.method === 'put' ||
        params.method === 'patch'
      ) {
        return this.jsonHttp[params.method]<R>({
          ...transformedRequestParams,
          body: params.body,
        });
      } else if (params.method === 'head') {
        return this.jsonHttp.head(transformedRequestParams) as Promise<
          JsonHttpResponse<R>
        >;
      } else {
        return this.jsonHttp[params.method]<R>(transformedRequestParams);
      }
    })();

    if (res.failure) {
      return res;
    } else if (originallyAcceptableStatusCodes.includes(res.response.status)) {
      return res;
    } else {
      if (res.response.status === 404) {
        return { failure: CommunicationError.NotFound };
      }

      if (res.response.status === 403) {
        return { failure: CommunicationError.Forbidden };
      }

      if (res.response.status === 401 && this.onInvalidAuthToken) {
        await this.onInvalidAuthToken();

        return { failure: CommunicationError.AbortedAndDealtWith };
      }

      return res.logAndReturnAsUnexpected();
    }
  }

  get<
    Response extends JsonHttpResponseBase = never,
    QueryParams extends URLSearchParams | undefined = never,
  >(params: {
    path: string;
    query: QueryParams;
    acceptableStatusCodes: readonly Response['status'][];
  }): Promise<JsonHttpResponse<Response>> {
    return this.doRequest({
      method: 'get',
      ...params,
    });
  }

  post<
    Response extends JsonHttpResponseBase = never,
    QueryParams extends URLSearchParams | undefined = never,
    RequestBody = never,
  >(params: {
    path: string;
    query: QueryParams;
    body: RequestBody;
    acceptableStatusCodes: readonly Response['status'][];
  }): Promise<JsonHttpResponse<Response>> {
    return this.doRequest({
      method: 'post',
      ...params,
    });
  }
  put<
    Response extends JsonHttpResponseBase = never,
    QueryParams extends URLSearchParams | undefined = never,
    RequestBody = never,
  >(params: {
    path: string;
    query: QueryParams;
    body: RequestBody;
    acceptableStatusCodes: readonly Response['status'][];
  }): Promise<JsonHttpResponse<Response>> {
    return this.doRequest({
      method: 'put',
      ...params,
    });
  }
  patch<
    Response extends JsonHttpResponseBase = never,
    QueryParams extends URLSearchParams | undefined = never,
    RequestBody = never,
  >(params: {
    path: string;
    query: QueryParams;
    body: RequestBody;
    acceptableStatusCodes: readonly Response['status'][];
  }): Promise<JsonHttpResponse<Response>> {
    return this.doRequest({
      method: 'patch',
      ...params,
    });
  }
  delete<
    Response extends JsonHttpResponseBase = never,
    QueryParams extends URLSearchParams | undefined = never,
  >(params: {
    path: string;
    query: QueryParams;
    acceptableStatusCodes: readonly Response['status'][];
  }): Promise<JsonHttpResponse<Response>> {
    return this.doRequest({
      method: 'delete',
      ...params,
    });
  }
  head<
    Response extends { status: number; body: undefined } = never,
    QueryParams extends URLSearchParams | undefined = never,
  >(params: {
    path: string;
    query: QueryParams;
    acceptableStatusCodes: readonly Response['status'][];
  }): Promise<JsonHttpResponse<Response>> {
    return this.doRequest({
      method: 'head',
      ...params,
    });
  }
}

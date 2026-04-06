import z from 'zod';
import {
  JSONApiBase,
} from './json-api-base';
import {
  JsonHttpHEADResponse,
  JsonHttpResponse,
} from './json-http-types';

type JsonHttpResponseBase = {
  status: number;
  body?: unknown;
};

export class ExternalJSONApi {
  private jsonApi: JSONApiBase;

  constructor(args: { jsonApi: JSONApiBase }) {
    this.jsonApi = args.jsonApi;
  }

  async get<
    S extends z.ZodType<JsonHttpResponseBase>,
    I extends JsonHttpResponseBase = z.infer<S>,
  >(
    schema: S,
    params: {
      acceptableStatusCodes: Array<I['status']>;
      path: string;
      query: URLSearchParams | undefined;
    },
  ): Promise<JsonHttpResponse<I>> {
    const res = await this.jsonApi.get(params);

    if (res.failure) {
      return res;
    } else {
      const validationResult = schema.safeParse(res.response);

      if (!validationResult.success) {
        return res.logAndReturnAsUnexpected();
      } else {
        return {
          ...res,
          response: validationResult.data as I,
        };
      }
    }
  }

  async post<
    S extends z.ZodType<JsonHttpResponseBase>,
    I extends JsonHttpResponseBase = z.infer<S>,
  >(
    schema: S,
    params: {
      acceptableStatusCodes: Array<I['status']>;
      path: string;
      query: URLSearchParams | undefined;
      body: unknown;
    },
  ): Promise<JsonHttpResponse<I>> {
    const res = await this.jsonApi.post(params);

    if (res.failure) {
      return res;
    } else {
      const validationResult = schema.safeParse(res.response);

      if (!validationResult.success) {
        return res.logAndReturnAsUnexpected();
      } else {
        return {
          ...res,
          response: validationResult.data as I,
        };
      }
    }
  }

  async put<
    S extends z.ZodType<JsonHttpResponseBase>,
    I extends JsonHttpResponseBase = z.infer<S>,
  >(
    schema: S,
    params: {
      acceptableStatusCodes: Array<I['status']>;
      path: string;
      query: URLSearchParams | undefined;
      body: unknown;
    },
  ): Promise<JsonHttpResponse<I>> {
    const res = await this.jsonApi.put(params);

    if (res.failure) {
      return res;
    } else {
      const validationResult = schema.safeParse(res.response);

      if (!validationResult.success) {
        return res.logAndReturnAsUnexpected();
      } else {
        return {
          ...res,
          response: validationResult.data as I,
        };
      }
    }
  }

  async patch<
    S extends z.ZodType<JsonHttpResponseBase>,
    I extends JsonHttpResponseBase = z.infer<S>,
  >(
    schema: S,
    params: {
      acceptableStatusCodes: Array<I['status']>;
      path: string;
      query: URLSearchParams | undefined;
      body: unknown;
    },
  ): Promise<JsonHttpResponse<I>> {
    const res = await this.jsonApi.patch(params);

    if (res.failure) {
      return res;
    } else {
      const validationResult = schema.safeParse(res.response);

      if (!validationResult.success) {
        return res.logAndReturnAsUnexpected();
      } else {
        return {
          ...res,
          response: validationResult.data as I,
        };
      }
    }
  }

  async delete<
    S extends z.ZodType<JsonHttpResponseBase>,
    I extends JsonHttpResponseBase = z.infer<S>,
  >(
    schema: S,
    params: {
      acceptableStatusCodes: Array<I['status']>;
      path: string;
      query: URLSearchParams | undefined;
    },
  ): Promise<JsonHttpResponse<I>> {
    const res = await this.jsonApi.delete(params);

    if (res.failure) {
      return res;
    } else {
      const validationResult = schema.safeParse(res.response);

      if (!validationResult.success) {
        return res.logAndReturnAsUnexpected();
      } else {
        return {
          ...res,
          response: validationResult.data as I,
        };
      }
    }
  }

  async head(params: {
    path: string;
    query: URLSearchParams | undefined;
    acceptableStatusCodes: number[];
  }): Promise<JsonHttpHEADResponse> {
    return this.jsonApi.head(params);
  }
}

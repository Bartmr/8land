// eslint-disable-next-line node/no-process-env
export const NODE_ENV = process.env.NODE_ENV;

export enum NodeEnv {
  Production = 'production',
  Development = 'development',
  Test = 'test',
}

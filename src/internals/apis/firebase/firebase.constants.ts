import { NODE_ENV } from 'src/internals/environment/node-env.constants';
import { NodeEnv } from 'src/internals/environment/node-env.types';

export const getFirebaseEmulatorProjectId = () => {
  if (NODE_ENV === NodeEnv.Development || NODE_ENV === NodeEnv.Test) {
    return `emulator-project-${NODE_ENV}`;
  } else {
    throw new Error();
  }
};

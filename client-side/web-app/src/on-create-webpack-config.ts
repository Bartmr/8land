/* eslint-disable no-console */
import { CreateWebpackConfigArgs } from 'gatsby';

import path from 'path';
import { promisify } from 'util';
import childProcess from 'child_process';

import { EnvironmentVariables } from './logic/app-internals/runtime/environment-variables';
import {
  GatsbyBuildTimeStore,
  GRAPHQL_TYPESCRIPT_GENERATOR_COMMAND,
  pathExists,
  saveGraphQLSchemaToFile,
} from './gatsby-build-utils';

const exec = promisify(childProcess.exec);

//
//

export async function onCreateWebpackConfig({
  store,
  actions,
}: CreateWebpackConfigArgs) {
  const generateGraphQLTypings = async () => {
    try {
      await exec('rimraf _graphql-generated_ *._graphql-generated_.ts');
      await saveGraphQLSchemaToFile(store as unknown as GatsbyBuildTimeStore);
      await exec(GRAPHQL_TYPESCRIPT_GENERATOR_COMMAND);
    } catch (err: unknown) {
      console.error(err);
      process.exit(1);
    }
  };

  // eslint-disable-next-line node/no-process-env
  if (process.env['NODE_ENV'] === 'development') {
    const graphqlTypingsExist = await pathExists(
      '_graphql-generated_/typescript',
    );

    if (!graphqlTypingsExist) {
      console.info(
        'Generating Typescript typings of GraphQL queries for the first time...',
      );

      await generateGraphQLTypings();
    }
  } else if (EnvironmentVariables.IS_INTEGRITY_CHECK) {
    await generateGraphQLTypings();
  }

  actions.setWebpackConfig({
    resolve: {
      alias: {
        /*
          Absolute imports should only be allowed to import from inside the `src` directory.

          This is to avoid build configurations
          and code with sensible information used at build time
          from being bundled with the client-side code.

          That's why we use a `src` alias instead of
          pointing the imports root directly to the root of the project.
        */
        src: path.join(process.cwd(), `src`),
        typeorm: path.join(
          process.cwd(),
          '../../node_modules/typeorm/typeorm-model-shim.js',
        ),
        '@app/shared': path.join(process.cwd(), '../../libs/shared/src'),
      },
    },
  });
}

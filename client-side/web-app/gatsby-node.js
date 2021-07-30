const {
  currentBuildVariant,
  ALL_BUILD_VARIANTS,
} = require('./bootstrap-build-environment');

const path = require('path');
const { promisify } = require('util');
const fs = require('fs');
const childProcess = require('child_process');

const { getIntrospectionQuery, graphql } = require('gatsby/graphql');

const access = promisify(fs.access);
const exists = async (path) => {
  try {
    await access(path, fs.constants.F_OK);
    return true;
  } catch (err) {
    return false;
  }
};
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const exec = promisify(childProcess.exec);

const { onCreatePage } = require('./src/on-create-page');
const {
  setFieldsOnGraphQLNodeType,
} = require('./src/set-fields-on-graphql-node-type');
const { onCreateNode } = require('./src/on-create-node');

// Bypass grep search for hardcoded config imports
const CONFIG_DIRECTORY_NAME = '__confi' + 'g.';
// Bypass grep search for relative imports of the shared library
const SHARED_LIBRARY_RELATIVE_IMPORT_SNIPPET = '../../libs/' + 'shared/src';

const GRAPHQL_TYPESCRIPT_GENERATOR_COMMAND =
  'graphql-codegen --config codegen.yml';

async function saveGraphQLSchemaToFile(store) {
  const { schema } = store.getState();
  if (!schema) throw new Error();

  const graphQlSchema = await graphql(schema, getIntrospectionQuery());

  const dir = '_graphql-generated_';

  if (!(await exists(dir))) {
    await mkdir(dir);
  }
  await writeFile(`${dir}/schema.json`, JSON.stringify(graphQlSchema));
}

exports.onCreatePage = onCreatePage;

exports.onCreateWebpackConfig = async ({
  actions,
  stage,
  getConfig,
  store,
}) => {
  if (currentBuildVariant === ALL_BUILD_VARIANTS.DEBUG) {
    const graphqlTypingsExist = await exists('_graphql-generated_/typescript');

    if (!graphqlTypingsExist) {
      console.info(
        'Generating Typescript typings of GraphQL queries for the first time...',
      );

      try {
        await exec('rimraf _graphql-generated_ *._graphql-generated_.ts');
        await saveGraphQLSchemaToFile(store);
        await exec(GRAPHQL_TYPESCRIPT_GENERATOR_COMMAND);
      } catch (err) {
        console.error(err);
        process.exit(1);
      }
    }
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
        src: path.join(__dirname, `src`),
        typeorm: path.join(
          __dirname,
          '../../node_modules/typeorm/typeorm-model-shim.js',
        ),
        '@app/shared': path.join(
          __dirname,
          // Bypass grep search for imports pointing to outside the project
          '../../' + 'libs/shared/src',
        ),
        '@config': path.join(
          __dirname,
          `${CONFIG_DIRECTORY_NAME}${currentBuildVariant}`,
        ),
      },
    },
  });
};

exports.setFieldsOnGraphQLNodeType = setFieldsOnGraphQLNodeType;
exports.onCreateNode = onCreateNode;

exports.onPreBuild = async ({ store }) => {
  try {
    await exec('rimraf _graphql-generated_ *._graphql-generated_.ts');
    await saveGraphQLSchemaToFile(store);
    await exec(GRAPHQL_TYPESCRIPT_GENERATOR_COMMAND);

    const grepScopeWithoutDeployRelatedCode = `./src ./type-declarations ./${CONFIG_DIRECTORY_NAME}*`;
    const grepScope = `${grepScopeWithoutDeployRelatedCode} gatsby*.* bootstrap-build-environment.*`;

    await Promise.all([
      (async () => {
        const hardcodedConfigImports = await exec(
          `grep -r "${CONFIG_DIRECTORY_NAME}" ${grepScope} || true`,
        );

        if (hardcodedConfigImports.stdout.trim()) {
          throw new Error(
            `Hardcoded configuration imports were found. Use the "@config" alias instead to import configuration files:\n${hardcodedConfigImports.stdout}`,
          );
        } else if (hardcodedConfigImports.stderr.trim()) {
          throw new Error(hardcodedConfigImports.stderr);
        }
      })(),
      (async () => {
        const hardcodedConfigImports = await exec(
          `grep -r "${SHARED_LIBRARY_RELATIVE_IMPORT_SNIPPET}" ${grepScope} || true`,
        );

        if (hardcodedConfigImports.stdout.trim()) {
          throw new Error(
            `Relative path imports of the shared library were found. Use the "@app/shared" alias instead of relative paths:\n${hardcodedConfigImports.stdout}`,
          );
        } else if (hardcodedConfigImports.stderr.trim()) {
          throw new Error(hardcodedConfigImports.stderr);
        }
      })(),
    ]);

    console.info('--- Type-checking code and configuration values...');

    const TYPESCRIPT_TYPE_CHECK_COMMAND = `tsc --p tsconfig.${currentBuildVariant}.json`;

    await exec(TYPESCRIPT_TYPE_CHECK_COMMAND);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

exports.onCreateDevServer = async ({ store }) => {
  try {
    const { spawn } = childProcess;

    await saveGraphQLSchemaToFile(store);

    const graphqlTypescriptGeneratorWatcherProcess = spawn(
      GRAPHQL_TYPESCRIPT_GENERATOR_COMMAND + ' --watch',
      {
        shell: true,
      },
    );

    graphqlTypescriptGeneratorWatcherProcess.stdout.on('data', function (data) {
      console.info('stdout: ' + data.toString());
    });

    graphqlTypescriptGeneratorWatcherProcess.stderr.on('data', function (data) {
      console.error('stderr: ' + data.toString());
    });

    graphqlTypescriptGeneratorWatcherProcess.on('exit', function (code) {
      if (code !== 0) {
        console.error(
          GRAPHQL_TYPESCRIPT_GENERATOR_COMMAND + ' exited with code ' + code,
        );
        process.exit(1);
      } else {
        console.info(
          GRAPHQL_TYPESCRIPT_GENERATOR_COMMAND + ' exited correctly.',
        );
      }
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

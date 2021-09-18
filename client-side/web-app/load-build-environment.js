if (
  process.env.NODE_ENV === 'development' ||
  process.env.IS_INTEGRITY_CHECK === 'true'
) {
  require('dotenv').config({
    path: '.env.development',
  });
}

const tsConfigFileName = 'tsconfig.json';

require('ts-node').register({
  transpileOnly: true,
  project: tsConfigFileName,
  compilerOptions: {
    module: 'commonjs',
    target: 'es2020',
  },
});

const tsConfig = require(`./${tsConfigFileName}`);
const tsConfigPaths = require('tsconfig-paths');

tsConfigPaths.register({
  baseUrl: './',
  paths: tsConfig.compilerOptions.paths,
});
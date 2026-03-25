require('./load-build-environment');

const { onCreateWebpackConfig } = require('./src/on-create-webpack-config');
const { onCreateDevServer } = require('./src/on-create-dev-server');

const {
  setFieldsOnGraphQLNodeType,
} = require('./src/set-fields-on-graphql-node-type');
const { onCreateNode } = require('./src/on-create-node');
const { onCreatePage } = require('./src/on-create-page');

exports.onCreateWebpackConfig = onCreateWebpackConfig;

exports.setFieldsOnGraphQLNodeType = setFieldsOnGraphQLNodeType;
exports.onCreateNode = onCreateNode;

exports.onCreateDevServer = onCreateDevServer;
exports.onCreatePage = onCreatePage;

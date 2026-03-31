const path = require('path')
const fs = require('fs')
const { promisify }= require('util')
const readFile = promisify(fs.readFile);
const { GraphQLString } = require('gatsby/graphql');

exports.onCreateWebpackConfig = async function({
  store,
  actions,
  getConfig,
}) {
  const config = getConfig();

  const newConfig = {
    ...config,
    resolve: {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        /*
          Absolute imports should only be allowed to import from inside the `src` directory.
  
          This is to avoid build configurations
          and code with sensible information used at build time
          from being bundled with the client-side code.
  
          That's why we use a `src` alias instead of
          pointing the imports root directly to the root of the project.
        */
        src: path.join(process.cwd(), `src`),
        '@shared': path.join(process.cwd(), '../shared'),
      },
    },
  };

  actions.replaceWebpackConfig(newConfig);
};

exports.setFieldsOnGraphQLNodeType = async function({
  type,
}) {
  if (type.name === `File`) {
    return {
      contents: {
        type: GraphQLString,
        resolve: (source) => {
          return source.fields?.contents;
        },
      },
    };
  } else {
    return {};
  }
};

exports.onCreateNode = async function (args) {
  const { node, actions } = args;

  if (node.internal.type === 'File') {
    const fileNode = node;

    const fileContents = await readFile(fileNode.absolutePath, {
      encoding: 'utf8',
    });

    actions.createNodeField({ node, name: `contents`, value: fileContents });
  }
}

exports.onCreatePage = function(args) {
  const { page, actions } = args;

  const { createPage } = actions;
  // page.matchPath is a special key that's used for matching pages
  // only on the client.
  if (page.path.startsWith('/client-side')) {
    page.matchPath = '/client-side/*';
    // Update the page.
    createPage(page);
  }
};

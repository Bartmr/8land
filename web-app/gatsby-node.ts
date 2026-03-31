import { GatsbyNode } from "gatsby";
import path from "path";

export const onCreateWebpackConfig: GatsbyNode["onCreateWebpackConfig"] = function({
  actions,
}) {
  actions.setWebpackConfig({
    resolve: {
      alias: {
        src: path.join(process.cwd(), `src`),
        '@shared': path.join(process.cwd(), '../shared'),
      }
    }
  })
};

export const onCreatePage: GatsbyNode["onCreatePage"] = function({ page, actions }) {

  // page.matchPath is a special key that's used for matching pages
  // only on the client.
  if (page.path.startsWith('/client-side')) {
    page.matchPath = '/client-side/*';
    // Update the page.
    actions.createPage(page);
  }
};

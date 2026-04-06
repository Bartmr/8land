import { GatsbyNode } from "gatsby";

export const onCreatePage: GatsbyNode["onCreatePage"] = function({ page, actions }) {

  // page.matchPath is a special key that's used for matching pages
  // only on the client.
  if (page.path.startsWith('/client')) {
    page.matchPath = '/client/*';
    // Update the page.
    actions.createPage(page);
  }
};

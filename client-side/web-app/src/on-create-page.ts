import { CreatePageArgs } from 'gatsby';

export function onCreatePage(args: CreatePageArgs) {
  const { page, actions } = args;

  const { createPage } = actions;
  // page.matchPath is a special key that's used for matching pages
  // only on the client.
  if (page.path.startsWith('/client-side')) {
    page.matchPath = '/client-side/*';
    // Update the page.
    createPage(page);
  }
}

import { NotFoundTemplate } from 'src/pages-impl/not-found/not-found-template';
import { HtmlHead } from 'src/pages-impl/html-head';
import type { PageProps } from 'gatsby';

export default NotFoundTemplate;

export function Head({ location }: PageProps) {
  return <HtmlHead location={location} title="404 Not Found" />;
}

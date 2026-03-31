import { LandIdeasTemplate } from 'src/pages-impl/help/lands/land-ideas/land-ideas-template';
import { HtmlHead } from 'src/pages-impl/html-head';
import type { PageProps } from 'gatsby';

export default LandIdeasTemplate;

export function Head({ location }: PageProps) {
  return <HtmlHead location={location} title="Land Ideas" />;
}

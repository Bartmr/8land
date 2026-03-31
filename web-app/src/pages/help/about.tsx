import { AboutTemplate } from 'src/pages-impl/help/about/about-template';
import { HtmlHead } from 'src/pages-impl/html-head';
import type { PageProps } from 'gatsby';

export default AboutTemplate;

export function Head({ location }: PageProps) {
  return <HtmlHead location={location} title="About" />;
}

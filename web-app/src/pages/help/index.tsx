import { HelpTemplate } from 'src/pages-impl/help/help-template';
import { HtmlHead } from 'src/pages-impl/html-head';
import type { PageProps } from 'gatsby';

export default HelpTemplate;

export function Head({ location }: PageProps) {
  return <HtmlHead location={location} title="Help" />;
}

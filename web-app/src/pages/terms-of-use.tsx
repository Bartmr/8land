import { TermsOfUseTemplate } from 'src/pages-impl/terms-of-use/terms-of-use-template';
import { HtmlHead } from 'src/pages-impl/html-head';
import type { PageProps } from 'gatsby';

export default TermsOfUseTemplate;

export function Head({ location }: PageProps) {
  return <HtmlHead location={location} title="Terms of Use" />;
}

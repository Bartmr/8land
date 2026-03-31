import { ContentPolicyTemplate } from 'src/pages-impl/content-policy/content-policy-template';
import { HtmlHead } from 'src/pages-impl/html-head';
import type { PageProps } from 'gatsby';

export default ContentPolicyTemplate;

export function Head({ location }: PageProps) {
  return <HtmlHead location={location} title="Content Policy" />;
}

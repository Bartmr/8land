import { PrivacyPolicyTemplate } from 'src/pages-impl/privacy-policy/privacy-policy-template';
import { HtmlHead } from 'src/pages-impl/html-head';
import type { PageProps } from 'gatsby';

export default PrivacyPolicyTemplate;

export function Head({ location }: PageProps) {
  return <HtmlHead location={location} title="Privacy Policy" />;
}

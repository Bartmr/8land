import React from 'react';
import { PrivacyPolicyTemplate } from '../page-components/privacy-policy/privacy-policy-template';
import { HtmlHead } from '../page-components/html-head/html-head';
import type { PageProps } from 'gatsby';

export default PrivacyPolicyTemplate;

export function Head({ location }: PageProps) {
  return <HtmlHead location={location} title="Privacy Policy" />;
}

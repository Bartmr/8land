import React from 'react';
import { PrivacyPolicyTemplate } from '../pages-impl/privacy-policy/privacy-policy-template';
import { HtmlHead } from '../pages-impl/html-head';
import type { PageProps } from 'gatsby';

export default PrivacyPolicyTemplate;

export function Head({ location }: PageProps) {
  return <HtmlHead location={location} title="Privacy Policy" />;
}

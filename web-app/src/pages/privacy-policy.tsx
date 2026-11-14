import React from 'react';
import { PrivacyPolicy } from '../page-components/privacy-policy/privacy-policy';
import { HtmlHead } from '../page-components/html-head/html-head';
import type { PageProps } from 'gatsby';

export default PrivacyPolicy;

export function Head({ location }: PageProps) {
  return <HtmlHead location={location} title="Privacy Policy" />;
}

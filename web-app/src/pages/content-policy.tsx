import React from 'react';
import { ContentPolicyTemplate } from '../pages-impl/content-policy/content-policy-template';
import { HtmlHead } from '../pages-impl/html-head/html-head';
import type { PageProps } from 'gatsby';

export default ContentPolicyTemplate;

export function Head({ location }: PageProps) {
  return <HtmlHead location={location} title="Content Policy" />;
}

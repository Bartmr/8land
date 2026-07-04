import React from 'react';
import { ContentPolicyTemplate } from '../content-policy/content-policy-template';
import { HtmlHead } from '../html-head';
import type { PageProps } from 'gatsby';

export default ContentPolicyTemplate;

export function Head({ location }: PageProps) {
  return <HtmlHead location={location} title="Content Policy" />;
}

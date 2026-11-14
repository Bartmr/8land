import React from 'react';
import { ContentPolicy } from '../page-components/content-policy/content-policy';
import { HtmlHead } from '../page-components/html-head/html-head';
import type { PageProps } from 'gatsby';

export default ContentPolicy;

export function Head({ location }: PageProps) {
  return <HtmlHead location={location} title="Content Policy" />;
}

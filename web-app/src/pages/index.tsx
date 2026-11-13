import React from 'react';
import { IndexTemplate } from '../page-components/index/index-template';
import { HtmlHead } from '../page-components/html-head/html-head';
import type { PageProps } from 'gatsby';

export default IndexTemplate;

export function Head({ location }: PageProps) {
  return <HtmlHead location={location} title="Home" />;
}

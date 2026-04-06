import React from 'react';
import { IndexTemplate } from '../pages-impl/index-template/index-template';
import { HtmlHead } from '../pages-impl/html-head';
import type { PageProps } from 'gatsby';

export default IndexTemplate;

export function Head({ location }: PageProps) {
  return <HtmlHead location={location} title="Home" />;
}

import React from 'react';
import { IndexTemplate } from '../index-template/index-template';
import { HtmlHead } from '../html-head';
import type { PageProps } from 'gatsby';

export default IndexTemplate;

export function Head({ location }: PageProps) {
  return <HtmlHead location={location} title="Home" />;
}

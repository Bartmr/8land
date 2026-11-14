import React from 'react';
import { Index } from '../page-components/index/index';
import { HtmlHead } from '../page-components/html-head/html-head';
import type { PageProps } from 'gatsby';

export default Index;

export function Head({ location }: PageProps) {
  return <HtmlHead location={location} title="Home" />;
}

import React from 'react';
import { NotFound } from '../page-components/not-found/not-found';
import { HtmlHead } from '../page-components/html-head/html-head';
import type { PageProps } from 'gatsby';

export default NotFound;

export function Head({ location }: PageProps) {
  return <HtmlHead location={location} title="404 Not Found" />;
}

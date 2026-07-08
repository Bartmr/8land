import React from 'react';
import { NotFoundTemplate } from '../pages-impl/not-found/not-found-template';
import { HtmlHead } from '../pages-impl/html-head/html-head';
import type { PageProps } from 'gatsby';

export default NotFoundTemplate;

export function Head({ location }: PageProps) {
  return <HtmlHead location={location} title="404 Not Found" />;
}

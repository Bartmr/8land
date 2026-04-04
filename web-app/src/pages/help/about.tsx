import React from 'react';
import { AboutTemplate } from '../../pages-impl/help/about/about-template';
import { HtmlHead } from '../../pages-impl/html-head';
import type { PageProps } from 'gatsby';

export default AboutTemplate;

export function Head({ location }: PageProps) {
  return <HtmlHead location={location} title="About" />;
}

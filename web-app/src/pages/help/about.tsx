import React from 'react';
import { AboutTemplate } from '../../page-components/help/about/about-template';
import { HtmlHead } from '../../page-components/html-head/html-head';
import type { PageProps } from 'gatsby';

export default AboutTemplate;

export function Head({ location }: PageProps) {
  return <HtmlHead location={location} title="About" />;
}

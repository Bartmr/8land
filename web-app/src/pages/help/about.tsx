import React from 'react';
import { About } from '../../page-components/help/about/about';
import { HtmlHead } from '../../page-components/html-head/html-head';
import type { PageProps } from 'gatsby';

export default About;

export function Head({ location }: PageProps) {
  return <HtmlHead location={location} title="About" />;
}

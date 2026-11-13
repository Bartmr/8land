import React from 'react';
import { LandIdeasTemplate } from '../../../page-components/help/lands/land-ideas/land-ideas-template';
import { HtmlHead } from '../../../page-components/html-head/html-head';
import type { PageProps } from 'gatsby';

export default LandIdeasTemplate;

export function Head({ location }: PageProps) {
  return <HtmlHead location={location} title="Land Ideas" />;
}

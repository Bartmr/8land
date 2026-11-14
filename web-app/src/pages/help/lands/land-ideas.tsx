import React from 'react';
import { LandIdeas } from '../../../page-components/help/lands/land-ideas/land-ideas';
import { HtmlHead } from '../../../page-components/html-head/html-head';
import type { PageProps } from 'gatsby';

export default LandIdeas;

export function Head({ location }: PageProps) {
  return <HtmlHead location={location} title="Land Ideas" />;
}

import React from 'react';
import { LandIdeasTemplate } from '../../../help/lands/land-ideas/land-ideas-template';
import { HtmlHead } from '../../../html-head';
import type { PageProps } from 'gatsby';

export default LandIdeasTemplate;

export function Head({ location }: PageProps) {
  return <HtmlHead location={location} title="Land Ideas" />;
}

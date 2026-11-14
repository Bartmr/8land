import React from 'react';
import { BuildingALandTemplate } from '../../../page-components/help/lands/building-a-land/building-a-land-template';
import { HtmlHead } from '../../../page-components/html-head/html-head';
import type { PageProps } from 'gatsby';

export default BuildingALandTemplate;

export function Head({ location }: PageProps) {
  return <HtmlHead location={location} title="Building a Land" />;
}

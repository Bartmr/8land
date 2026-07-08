import React from 'react';
import { BuildingALandTemplate } from '../../../pages-impl/help/lands/building-a-land/building-a-land.template';
import { HtmlHead } from '../../../pages-impl/html-head/html-head';
import type { PageProps } from 'gatsby';

export default BuildingALandTemplate;

export function Head({ location }: PageProps) {
  return <HtmlHead location={location} title="Building a Land" />;
}

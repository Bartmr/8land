import React from 'react';
import { BuildingALandTemplate } from '../../../help/lands/building-a-land/building-a-land.template';
import { HtmlHead } from '../../../html-head';
import type { PageProps } from 'gatsby';

export default BuildingALandTemplate;

export function Head({ location }: PageProps) {
  return <HtmlHead location={location} title="Building a Land" />;
}

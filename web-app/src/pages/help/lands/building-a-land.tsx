import React from 'react';
import { BuildingALand } from '../../../page-components/help/lands/building-a-land/building-a-land';
import { HtmlHead } from '../../../page-components/html-head/html-head';
import type { PageProps } from 'gatsby';

export default BuildingALand;

export function Head({ location }: PageProps) {
  return <HtmlHead location={location} title="Building a Land" />;
}

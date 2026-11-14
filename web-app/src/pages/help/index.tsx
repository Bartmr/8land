import React from 'react';
import { Help } from '../../page-components/help/help';
import { HtmlHead } from '../../page-components/html-head/html-head';
import type { PageProps } from 'gatsby';

export default Help;

export function Head({ location }: PageProps) {
  return <HtmlHead location={location} title="Help" />;
}

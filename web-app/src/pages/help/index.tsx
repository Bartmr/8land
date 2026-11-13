import React from 'react';
import { HelpTemplate } from '../../page-components/help/help-template';
import { HtmlHead } from '../../page-components/html-head/html-head';
import type { PageProps } from 'gatsby';

export default HelpTemplate;

export function Head({ location }: PageProps) {
  return <HtmlHead location={location} title="Help" />;
}

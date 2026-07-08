import React from 'react';
import { HelpTemplate } from '../../pages-impl/help/help-template';
import { HtmlHead } from '../../html-head';
import type { PageProps } from 'gatsby';

export default HelpTemplate;

export function Head({ location }: PageProps) {
  return <HtmlHead location={location} title="Help" />;
}

import React from 'react';
import { TermsOfUseTemplate } from '../pages-impl/terms-of-use/terms-of-use-template';
import { HtmlHead } from '../pages-impl/html-head/html-head';
import type { PageProps } from 'gatsby';

export default TermsOfUseTemplate;

export function Head({ location }: PageProps) {
  return <HtmlHead location={location} title="Terms of Use" />;
}

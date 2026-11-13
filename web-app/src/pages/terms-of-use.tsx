import React from 'react';
import { TermsOfUseTemplate } from '../page-components/terms-of-use/terms-of-use-template';
import { HtmlHead } from '../page-components/html-head/html-head';
import type { PageProps } from 'gatsby';

export default TermsOfUseTemplate;

export function Head({ location }: PageProps) {
  return <HtmlHead location={location} title="Terms of Use" />;
}

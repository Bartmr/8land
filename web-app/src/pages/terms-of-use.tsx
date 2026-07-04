import React from 'react';
import { TermsOfUseTemplate } from '../terms-of-use/terms-of-use-template';
import { HtmlHead } from '../html-head';
import type { PageProps } from 'gatsby';

export default TermsOfUseTemplate;

export function Head({ location }: PageProps) {
  return <HtmlHead location={location} title="Terms of Use" />;
}

import React from 'react';
import { TermsOfUse } from '../page-components/terms-of-use/terms-of-use';
import { HtmlHead } from '../page-components/html-head/html-head';
import type { PageProps } from 'gatsby';

export default TermsOfUse;

export function Head({ location }: PageProps) {
  return <HtmlHead location={location} title="Terms of Use" />;
}

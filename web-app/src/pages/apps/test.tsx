import React from 'react';
import { TestAppTemplate } from '../../page-components/apps/test/test-app-template';
import { HtmlHead } from '../../page-components/html-head/html-head';
import type { PageProps } from 'gatsby';

export default TestAppTemplate;

export function Head({ location }: PageProps) {
  return <HtmlHead location={location} title="Test App" />;
}

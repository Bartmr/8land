import React from 'react';
import { TestAppTemplate } from '../../apps/test/test-app-template';
import { HtmlHead } from '../../html-head';
import type { PageProps } from 'gatsby';

export default TestAppTemplate;

export function Head({ location }: PageProps) {
  return <HtmlHead location={location} title="Test App" />;
}

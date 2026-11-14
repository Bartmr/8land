import React from 'react';
import { TestApp } from '../../page-components/apps/test/test-app';
import { HtmlHead } from '../../page-components/html-head/html-head';
import type { PageProps } from 'gatsby';

export default TestApp;

export function Head({ location }: PageProps) {
  return <HtmlHead location={location} title="Test App" />;
}

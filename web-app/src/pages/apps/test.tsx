import { TestAppTemplate } from 'src/pages-impl/apps/test/test-app-template';
import { HtmlHead } from 'src/pages-impl/html-head';
import type { PageProps } from 'gatsby';

export default TestAppTemplate;

export function Head({ location }: PageProps) {
  return <HtmlHead location={location} title="Test App" />;
}

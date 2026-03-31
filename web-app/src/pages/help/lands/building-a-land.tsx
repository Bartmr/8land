import { BuildingALandTemplate } from 'src/pages-impl/help/lands/building-a-land/building-a-land.template';
import { HtmlHead } from 'src/pages-impl/html-head';
import type { PageProps } from 'gatsby';

export default BuildingALandTemplate;

export function Head({ location }: PageProps) {
  return <HtmlHead location={location} title="Building a Land" />;
}

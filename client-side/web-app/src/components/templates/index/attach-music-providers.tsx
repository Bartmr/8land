import { PreRenderHTMLArgs } from 'gatsby';

export function attachBackgroundMusicProviders({
  getPostBodyComponents,
  replacePostBodyComponents,
}: PreRenderHTMLArgs) {
  const postBodyElements = getPostBodyComponents();

  replacePostBodyComponents([
    ...postBodyElements,
    <script
      key="soundcloud-widget-api-script"
      src="https://w.soundcloud.com/player/api.js"
    ></script>,
  ]);
}

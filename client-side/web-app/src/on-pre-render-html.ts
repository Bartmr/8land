import { PreRenderHTMLArgs } from 'gatsby';
import { attachFontsProviders } from './components/ui-kit/fonts-ssr-apis';
import sortBy from 'lodash/sortBy';
import { attachBackgroundMusicProviders } from './components/templates/client-side/index/attach-music-providers';

export function onPreRenderHTML(args: PreRenderHTMLArgs) {
  attachFontsProviders(args);
  attachBackgroundMusicProviders(args);

  const headComponents = args.getHeadComponents() as Array<
    React.ReactNode & { type?: string }
  >;

  args.replaceHeadComponents(
    sortBy(headComponents, (c) => {
      if (c.type === 'style' || c.type === 'script' || c.type === 'noscript') {
        return 2;
      } else if (c.type === 'link') {
        return 1;
      } else {
        return 0;
      }
    }),
  );
}

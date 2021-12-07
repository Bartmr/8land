import { PreRenderHTMLArgs } from 'gatsby';
import { attachFontsProviders } from './components/ui-kit/fonts-ssr-apis';
import sortBy from 'lodash/sortBy';
import { attachBackgroundMusicProviders } from './components/templates/index/attach-music-providers';

export function onPreRenderHTML(args: PreRenderHTMLArgs) {
  attachFontsProviders(args);
  attachBackgroundMusicProviders(args);

  const headComponents = args.getHeadComponents() as Array<
    React.ReactNode & { type?: string }
  >;

  args.replaceHeadComponents(
    sortBy(headComponents, (c) => {
      return c.type === 'style' || c.type === 'script' || c.type === 'noscript'
        ? 1
        : 0;
    }),
  );
}

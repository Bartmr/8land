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
    sortBy(
      sortBy(headComponents, (c) => {
        return c.type === 'link' ? 1 : 0;
      }),
      (c) => {
        return c.type === 'style' ||
          c.type === 'script' ||
          c.type === 'noscript'
          ? 1
          : 0;
      },
    ),
  );
}

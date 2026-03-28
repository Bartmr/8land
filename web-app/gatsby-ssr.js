// KEEP AS TOP IMPORT
import { RootFrame } from './src/components/root-frame/root-frame';

//

function attachBackgroundMusicProviders({
  getPostBodyComponents,
  replacePostBodyComponents,
}) {
  const postBodyElements = getPostBodyComponents();

  replacePostBodyComponents([
    ...postBodyElements,
    <script
      key="soundcloud-widget-api-script"
      src="https://w.soundcloud.com/player/api.js"
    ></script>,
  ]);
}

const attachFontsProviders = ({
  getHeadComponents,
  replaceHeadComponents,
}) => {
  const elements = getHeadComponents();

  replaceHeadComponents([
    ...elements,
    <link
      key={'fonts-googleapis-preconnect'}
      rel="preconnect"
      href="https://fonts.googleapis.com"
    />,
    <link
      key={'fonts-gstatic-preconnect'}
      rel="preconnect"
      href="https://fonts.gstatic.com"
      crossOrigin="anonymous"
    />,
    <link
      key={'font1-stylesheet'}
      href="https://fonts.googleapis.com/css2?family=VT323&display=swap"
      rel="stylesheet"
    />,
  ]);
};

export const onPreRenderHTML = function (args) {
  attachFontsProviders(args);
  attachBackgroundMusicProviders(args);

  const headComponents = args.getHeadComponents()

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
};

export const wrapRootElement = ({ element }) => {
  return <RootFrame>{element}</RootFrame>;
};

import React from 'react'
import { GatsbySSR } from 'gatsby';
import { App } from './src/app';


export const onPreRenderHTML: GatsbySSR["onPreRenderHTML"] = ({
  getHeadComponents,
  replaceHeadComponents,
  getPostBodyComponents,
  replacePostBodyComponents
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
      key={'font-base-stylesheet'}
      href="https://fonts.googleapis.com/css2?family=VT323&display=swap"
      rel="stylesheet"
    />,
  ]);

  const postBodyElements = getPostBodyComponents();

  replacePostBodyComponents([
    ...postBodyElements,
    <script
      key="soundcloud-widget-api-script"
      src="https://w.soundcloud.com/player/api.js"
    ></script>,
  ]);
};

export const wrapRootElement: GatsbySSR['wrapRootElement'] = ({ element }) => {
  return <App>{element}</App>;
};

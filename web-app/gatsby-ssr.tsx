import React from 'react'
import { GatsbySSR } from 'gatsby';
import { App } from './src/app';


export const onPreRenderHTML: GatsbySSR["onPreRenderHTML"] = ({
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
      key={'font-base-stylesheet'}
      href="https://fonts.googleapis.com/css2?family=VT323&display=swap"
      rel="stylesheet"
    />,
  ]);
};

export const wrapRootElement: GatsbySSR['wrapRootElement'] = ({ element }) => {
  return <App>{element}</App>;
};

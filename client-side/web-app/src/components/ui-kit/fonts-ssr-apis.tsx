import { PreRenderHTMLArgs } from 'gatsby';
import React from 'react';

export const attachFontsProviders = ({
  getHeadComponents,
  replaceHeadComponents,
}: PreRenderHTMLArgs) => {
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

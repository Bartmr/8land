import { PreRenderHTMLArgs } from 'gatsby';
import React from 'react';

export const attachFontsProviders = ({
  getPostBodyComponents,
  replacePostBodyComponents,
}: PreRenderHTMLArgs) => {
  const elements = getPostBodyComponents();

  replacePostBodyComponents([
    ...elements,
    <link
      key="font-stylesheet"
      href="https://fonts.googleapis.com/css2?family=VT323&display=swap"
      rel="stylesheet"
    />,
  ]);
};

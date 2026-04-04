import React from 'react'
import { GatsbySSR } from 'gatsby';
import { App } from './src/app';

export const wrapRootElement: GatsbySSR['wrapRootElement'] = ({ element }) => {
  return <App>{element}</App>;
};

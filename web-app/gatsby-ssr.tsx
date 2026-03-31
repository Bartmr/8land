// KEEP AS TOP IMPORT
import { GatsbySSR } from 'gatsby';
import { App } from './src/app';

//
export const wrapRootElement: GatsbySSR['wrapRootElement'] = ({ element }) => {
  return <App>{element}</App>;
};

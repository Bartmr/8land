// KEEP AS TOP IMPORT
import { App } from './src/app';

//
export const wrapRootElement = ({ element }) => {
  return <App>{element}</App>;
};

// KEEP AS TOP IMPORT
import { RootFrame } from './src/components/root-frame/root-frame';

//
export const wrapRootElement = ({ element }) => {
  return <RootFrame>{element}</RootFrame>;
};

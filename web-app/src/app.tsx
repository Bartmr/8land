import './logging/logger';
import './environment-variables';
import './ui/index.scss';
import './ui/icons.scss';

import React, { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { AuthenticationStateProvider } from './users/authentication/authentication-state';
import { AuthenticationEffects } from './users/authentication/authentication-effects';

export const App = (props: { children: ReactNode }) => {

  return (
    <>
      <AuthenticationStateProvider>
        <AuthenticationEffects />
        {props.children}
      </AuthenticationStateProvider>
    </>
  );
};

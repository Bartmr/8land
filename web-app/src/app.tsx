import './core/logging/logger';
import './core/environment-variables';
import './core/ui/index.scss';

import React, { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { AuthenticationStateProvider } from './core/users/authentication/authentication-state';
import { AuthenticationEffects } from './core/users/authentication/authentication-effects';

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

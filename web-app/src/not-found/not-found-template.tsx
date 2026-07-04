import React from 'react';
import { RouteComponentProps } from '@reach/router';
import { Layout } from '../layout/layout';
import { CommunicationError } from '../communication-errors/communication-errors';
import { CommunicatedDataGate } from '../ui/communicated-data-gate';
type Props = RouteComponentProps;

export const NotFoundTemplate = (_: Props) => (
  <Layout>
    {() => {
      return (
        <CommunicatedDataGate
          dataWrapper={{ status: CommunicationError.NotFound }}
        >
          {() => null}
        </CommunicatedDataGate>
      );
    }}
  </Layout>
);

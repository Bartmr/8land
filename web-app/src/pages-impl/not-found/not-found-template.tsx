import React from 'react';
import { RouteComponentProps } from '@reach/router';
import { Layout } from '../layout/layout';
import { CommunicationError } from '../../communication-errors/communication-errors';
import { TransportedDataGate } from '../../ui/transported-data-gate';
type Props = RouteComponentProps;

export const NotFoundTemplate = (_: Props) => (
  <Layout>
    {() => {
      return (
        <TransportedDataGate
          dataWrapper={{ status: CommunicationError.NotFound }}
        >
          {() => null}
        </TransportedDataGate>
      );
    }}
  </Layout>
);

import React from 'react';
import { RouteComponentProps } from '@reach/router';
import { Layout } from 'src/pages-impl/layout/layout';
import { CommunicationError } from 'src/communication-errors/communication-errors';
import { TransportedDataGate } from 'src/ui/transported-data-gate';
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

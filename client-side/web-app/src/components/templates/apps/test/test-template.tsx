import { AppLayout } from 'src/components/routing/layout/app-layout';
import { TransportedDataGate } from 'src/components/shared/transported-data-gate/transported-data-gate';
import { AppContextProvider, useAppContext } from '../app-context';

function Content() {
  const appContext = useAppContext();

  return (
    <TransportedDataGate dataWrapper={appContext}>
      {({ data }) => {
        return <pre>{JSON.stringify(data, undefined, 2)}</pre>;
      }}
    </TransportedDataGate>
  );
}

export function TestAppTemplate() {
  return (
    <AppLayout>
      {() => {
        return (
          <AppContextProvider>
            <Content />
          </AppContextProvider>
        );
      }}
    </AppLayout>
  );
}

import { AppLayout } from 'src/components/routing/layout/app-layout';

export function TrainTicketMachineTemplate() {
  return (
    <AppLayout>
      {() => {
        return <div className="py-4 container"></div>;
      }}
    </AppLayout>
  );
}

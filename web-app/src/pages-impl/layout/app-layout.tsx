import { ReactNode } from 'react';
import 'src/components/ui-kit/global-styles/global-styles';

export function AppLayout(props: { children: () => ReactNode }) {
  return (
    <main className={`min-vh-100 w-100 bg-lightest`}>{props.children()}</main>
  );
}

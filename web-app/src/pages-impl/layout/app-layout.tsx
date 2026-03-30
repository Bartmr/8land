import { ReactNode } from 'react';

export function AppLayout(props: { children: () => ReactNode }) {
  return (
    <main className={`min-vh-100 w-100 bg-lightest`}>{props.children()}</main>
  );
}

import React, { useEffect, useState } from 'react';
import { Layout } from 'src/components/routing/layout/layout';
import { INDEX_ROUTE } from './index-routes';

function Content() {
  const [started, replaceStarted] = useState(false);
  useEffect(() => {
    (async () => {
      if (!started) {
        replaceStarted(true);

        const { runGame } = await import('./game');

        await runGame();
      }
    })();
  }, []);
  return <div id="game-root"></div>;
}

export const IndexTemplate = () => (
  <Layout title={INDEX_ROUTE.label}>
    {() => {
      return <Content />;
    }}
  </Layout>
);

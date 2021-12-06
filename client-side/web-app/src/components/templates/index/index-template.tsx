import React, { useEffect, useState } from 'react';
import { Layout } from 'src/components/routing/layout/layout';
import { INDEX_ROUTE } from './index-routes';

function Content() {
  const [started, replaceStarted] = useState(false);

  useEffect(() => {
    (async () => {
      if (started) {
        if (module.hot) {
          import('./game');
        }
      } else {
        replaceStarted(true);

        const { runGame } = await import('./game');

        await runGame();
      }
    })();
  });

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-md-9 col-lg-6">
        <div id="game-root"></div>
        <div
          id="youtube-player"
          style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}
        ></div>
      </div>
    </div>
  );
}

export const IndexTemplate = () => (
  <Layout title={INDEX_ROUTE.label}>
    {() => {
      return <Content />;
    }}
  </Layout>
);

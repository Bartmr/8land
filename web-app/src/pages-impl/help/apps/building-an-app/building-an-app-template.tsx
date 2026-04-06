import React from 'react';
import { Layout } from '../../../layout/layout';
import { BUILDING_AN_APP_ROUTE } from './building-an-app-routes';

export function BuildingALandTemplate() {
  return (
    <Layout>
      {() => {
        return (
          <>
            <style>
              {`
          #building-a-land-steps li {
            margin-bottom: 1rem;
          }
          `}
            </style>
            <h1>{BUILDING_AN_APP_ROUTE.title}</h1>
            <ol id="building-a-land-steps">
              <li></li>
            </ol>
            <p>To be written... Come back later.</p>
          </>
        );
      }}
    </Layout>
  );
}

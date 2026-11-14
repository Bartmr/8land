import React from 'react';
import { RouteComponentProps } from '@reach/router';
import { Layout } from '../layout/layout';
import { FaSearch } from 'react-icons/fa';
type Props = RouteComponentProps;

export const NotFound = (_: Props) => (
  <Layout>
    {() => {
      return (
        <div className=" ">
          <div className="d-flex flex-column justify-content-center align-items-center">
            <FaSearch style={{ fontSize: '2rem' }} />
            <p className="mt-3 text-center mb-0">Not Found</p>
          </div>
        </div>
      );
    }}
  </Layout>
);

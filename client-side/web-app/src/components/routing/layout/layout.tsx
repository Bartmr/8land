import 'src/components/ui-kit/global-styles/global-styles';

import { graphql, useStaticQuery } from 'gatsby';
import { ReactNode } from 'react';
import { Helmet } from 'react-helmet';
import { throwError } from 'src/logic/app-internals/utils/throw-error';
import { Header } from './header/header';
import { GQLLayoutQuery } from './layout._graphql-generated_';
import SSRProvider from 'react-bootstrap/SSRProvider';

type Props = {
  children: () => ReactNode;
  title: string;
  noContainment?: boolean;
  noTopPadding?: boolean;
  noBottomPadding?: boolean;
  disableScroll?: boolean;
  noHeader?: boolean;
};

export function Layout(props: Props) {
  const { site } = useStaticQuery<GQLLayoutQuery>(graphql`
    query Layout {
      site {
        siteMetadata {
          title
        }
      }
    }
  `);

  const siteMetadata = site?.siteMetadata || throwError();
  const siteTitle = siteMetadata.title || throwError();

  const title = `${props.title} - ${siteTitle}`;

  return (
    <SSRProvider>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <div
        className={`${
          props.disableScroll ? '' : 'min-vh-100'
        } d-flex flex-column align-items-stretch`}
      >
        {props.disableScroll ? (
          <style>
            {`body {
              overscroll-behavior: contain;
              overflow: hidden;
            }`}
          </style>
        ) : null}
        {props.noHeader ? null : (
          <Header menuHtmlId="page-header-menu" className="sticky-top" />
        )}
        <main
          className={`flex-fill ${props.noContainment ? '' : 'container'} ${
            props.noTopPadding ? '' : 'pt-3'
          } ${props.noBottomPadding ? '' : 'pb-3'}`}
        >
          {props.children()}
        </main>
        {/* TODO: Footer goes here */}
      </div>
    </SSRProvider>
  );
}

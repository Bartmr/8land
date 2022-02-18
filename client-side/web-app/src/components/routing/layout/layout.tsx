import 'src/components/ui-kit/global-styles/global-styles';

import { graphql, useStaticQuery } from 'gatsby';
import { ReactNode, useState } from 'react';
import { Helmet } from 'react-helmet';
import { throwError } from 'src/logic/app-internals/utils/throw-error';
import { Header } from './header/header';
import { GQLLayoutQuery } from './layout._graphql-generated_';
import SSRProvider from 'react-bootstrap/SSRProvider';
import { useLocation } from '@reach/router';
import { EnvironmentVariables } from 'src/logic/app-internals/runtime/environment-variables';
import { PROJECT_SLOGAN } from '@app/shared/project-details';
import { LinkAnchor } from 'src/components/ui-kit/protons/link-anchor/link-anchor';
import { PRIVACY_POLICY_ROUTE } from 'src/components/templates/privacy-policy/privacy-policy-routes';
import logo from 'src/assets/vendors/this-project/logo.svg';
import { TERMS_OF_USE_ROUTE } from 'src/components/templates/terms-of-use/terms-of-use-routes';
import { CONTENT_POLICY_ROUTE } from 'src/components/templates/content-policy/content-policy-routes';
import { dom } from '@fortawesome/fontawesome-svg-core';

type Props = {
  children: (renderProps: {
    hideHeaderAndFooter: () => void;
    showHeaderAndFooter: () => void;
  }) => ReactNode;
  title: string;
  noContainment?: boolean;
  noTopPadding?: boolean;
  noBottomPadding?: boolean;
  disableScroll?: boolean;
};

export function Layout(props: Props) {
  const location = useLocation();

  const { site, siteThumbnail } = useStaticQuery<GQLLayoutQuery>(graphql`
    query Layout {
      site {
        siteMetadata {
          title
          siteUrl
        }
      }
      siteThumbnail: file(
        sourceInstanceName: { eq: "src-assets" }
        relativePath: { eq: "vendors/this-project/logo.png" }
      ) {
        childImageSharp {
          original {
            src
            height
            width
          }
        }
        extension
      }
    }
  `);

  const siteMetadata = site?.siteMetadata || throwError();
  const siteTitle = siteMetadata.title || throwError();

  const title = `${props.title} - ${siteTitle}`;

  const description = PROJECT_SLOGAN;

  const siteUrl = siteMetadata.siteUrl || throwError();

  const url = EnvironmentVariables.HOST_URL + location.pathname;

  const thumbnail = {
    src: siteThumbnail?.childImageSharp?.original?.src || throwError(),
    width: siteThumbnail?.childImageSharp?.original?.width ?? throwError(),
    height: siteThumbnail?.childImageSharp?.original?.height ?? throwError(),
    extension: siteThumbnail?.extension ?? throwError(),
  };

  const [hideHeader, replaceHideHeader] = useState(false);

  return (
    <SSRProvider>
      <Helmet>
        <html lang="en" />
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="robots" content="index, follow" />

        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />

        <meta property="og:type" content="website" />

        <meta property="og:image" content={`${siteUrl}${thumbnail.src}`} />
        <meta
          property="og:image:secure_url"
          content={`${siteUrl}${thumbnail.src}`}
        />
        <meta
          property="og:image:type"
          content={`image/${thumbnail.extension}`}
        />
        <meta property="og:image:width" content={`${thumbnail.width}`} />
        <meta property="og:image:height" content={`${thumbnail.height}`} />
        <meta property="og:image:alt" content="Website Thumbnail" />
        <meta property="og:url" content={url} />
        <meta property="og:locale" content="en" />
        <meta property="og:site_name" content={siteTitle} />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:url" content={url} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={`${siteUrl}${thumbnail.src}`} />
        <style type="text/css">{dom.css()}</style>
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
        {hideHeader ? null : (
          <Header menuHtmlId="page-header-menu" className="sticky-top" />
        )}
        <main
          className={`flex-fill ${props.noContainment ? '' : 'container'} ${
            props.noTopPadding ? '' : 'pt-3'
          } ${props.noBottomPadding ? '' : 'pb-3'}`}
        >
          {props.children({
            showHeaderAndFooter: () => replaceHideHeader(false),
            hideHeaderAndFooter: () => replaceHideHeader(true),
          })}
        </main>
        {hideHeader || props.disableScroll ? null : (
          <footer className="border-top py-4">
            <div className="container">
              <div className="row g-3 flex-lg-row-reverse align-items-center justify-content-center">
                <div className="col-12 col-lg-6">
                  <ul className="list-unstyled m-0">
                    <li className="text-lg-end mb-3">
                      <LinkAnchor
                        className="link-body-shade"
                        href={PRIVACY_POLICY_ROUTE.getHref()}
                      >
                        Privacy Policy
                      </LinkAnchor>
                    </li>
                    <li className="text-lg-end mb-3">
                      <LinkAnchor
                        className="link-body-shade"
                        href={TERMS_OF_USE_ROUTE.getHref()}
                      >
                        Terms of User
                      </LinkAnchor>
                    </li>
                    <li className="text-lg-end">
                      <LinkAnchor
                        className="link-body-shade"
                        href={CONTENT_POLICY_ROUTE.getHref()}
                      >
                        Content Policy
                      </LinkAnchor>
                    </li>
                  </ul>
                </div>
                <div className="col-12 col-lg-6">
                  <div className="mt-4 mt-lg-0 d-flex align-items-center">
                    <img height={'48px'} src={logo} alt="8Land Logo" />
                    <div className="ms-2">
                      <span style={{ fontFamily: 'sans-serif' }}>&copy;</span>{' '}
                      {new Date().getFullYear()} 8Land
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        )}
      </div>
    </SSRProvider>
  );
}

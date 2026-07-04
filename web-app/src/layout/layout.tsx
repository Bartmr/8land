
import React from 'react';
import { graphql, useStaticQuery } from 'gatsby';
import { ReactNode, useState } from 'react';
import { Header } from './header/header';
import { useLocation } from '@reach/router';
import { LinkAnchor } from '../ui/link-anchor';
import { PRIVACY_POLICY_ROUTE } from '../privacy-policy/privacy-policy-routes';
import logo from '../../logo.svg';
import { TERMS_OF_USE_ROUTE } from '../terms-of-use/terms-of-use-routes';
import { CONTENT_POLICY_ROUTE } from '../content-policy/content-policy-routes';

type Props = {
  children: (renderProps: {
    hideHeaderAndFooter: () => void;
    showHeaderAndFooter: () => void;
  }) => ReactNode;
  noContainment?: boolean;
  noTopPadding?: boolean;
  noBottomPadding?: boolean;
  disableScroll?: boolean;
};

export function Layout(props: Props) {
  const [hideHeader, replaceHideHeader] = useState(false);

  return (
    <>
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
                <div className="col-12 col-lg-3">
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
                        Terms of Use
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
    </>
  );
}

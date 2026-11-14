import React from 'react';
import { useEffect, useState } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import * as styles from './header.module.scss';
import { LinkAnchor } from '../../../ui/link-anchor';
import { PROJECT_NAME } from '../../../project-details';
import { FaBars, FaUser } from 'react-icons/fa';
import { ApiFetchErrors } from '../../../api/fetch-errors';
import {
  FaExclamationCircle,
  FaWifi,
} from 'react-icons/fa';
import { LANDS_ROUTE } from '../../client/lands/lands-routes';
import { USER_ROUTE } from '../../client/user/user-routes';
import { INDEX_ROUTE } from '../../index/index-routes';
import { LOGIN_ROUTE } from '../../client/login/login-routes';
import { getCurrentLocalHref } from '../../../navigation/current-local-href';
import { HELP_ROUTE } from '../../help/help-routes';
import { CLIENT_SIDE_INDEX_ROUTE } from '../../client/index/index-routes';
import logo from '../../../logo.svg'
import { useAuthenticationStateSession } from '../../../users/authentication/authentication-state';

type Props = {
  menuHtmlId: string;
  className: string;
};

/*
  TODO: add menu items
*/

export function Header(props: Props) {
  const [expanded, replaceExpanded] = useState<boolean>(false);

  const session = useAuthenticationStateSession();

  const expandMenu = () => {
    replaceExpanded(true);
  };

  const collapseMenu = () => {
    replaceExpanded(false);
  };

  useEffect(() => {
    const resizeHandler = () => {
      if (expanded) {
        collapseMenu();
      }
    };

    window.addEventListener('resize', resizeHandler);

    return () => {
      window.removeEventListener('resize', resizeHandler);
    };
  }, []);

  return (
    <>
      <header className={`border-bottom ${props.className}`}>
        <Navbar className='navbar-dark bg-body' collapseOnSelect expand="lg" expanded={expanded}>
          <div className="container">
            <Navbar.Toggle
              onClick={() => {
                if (expanded) {
                  collapseMenu();
                } else {
                  expandMenu();
                }
              }}
              aria-controls={props.menuHtmlId}
            >
              <FaBars />
            </Navbar.Toggle>
            <LinkAnchor
              className="navbar-brand d-flex align-items-center"
              href={INDEX_ROUTE.getHref()}
            >
              <img src={logo} height={"48px"}/>
              <span className="h3 m-0">and</span>
            </LinkAnchor>
            <Navbar.Collapse id={props.menuHtmlId}>
              <ul className="navbar-nav">
                <li className="nav-item">
                  <LinkAnchor
                    activeClassName="active"
                    className="nav-link"
                    href={CLIENT_SIDE_INDEX_ROUTE.getHref()}
                  >
                    {CLIENT_SIDE_INDEX_ROUTE.label}
                  </LinkAnchor>
                </li>
                <li className="nav-item">
                  <LinkAnchor
                    activeClassName="active"
                    className="nav-link"
                    href={LANDS_ROUTE.getHref()}
                  >
                    {LANDS_ROUTE.label}
                  </LinkAnchor>
                </li>
                {/* <div className="navbar-nav-divider" />
                <li className="nav-item">
                  <LinkAnchor
                    activeClassName="active"
                    className="nav-link"
                    href={NFTS_ROUTE.getHref()}
                  >
                    {'Collectibles'}
                  </LinkAnchor>
                </li> */}
                <div className="navbar-nav-divider" />

                <li className="nav-item">
                  <LinkAnchor
                    activeClassName="active"
                    className="nav-link"
                    href={HELP_ROUTE.getHref()}
                  >
                    {HELP_ROUTE.title}
                  </LinkAnchor>
                </li>
              </ul>

              <div
                className={
                  session.loading && session.data !== undefined
                    ? 'd-flex flex-row align-items-center ms-auto'
                    : ' ms-auto'
                }
              >
                {session.loading && session.data === undefined ? (
                  <div className="d-flex flex-row justify-content-center align-items-center">
                    <div
                      className="d-block spinner-sm spinner-border text-primary"
                      role="status"
                    >
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : null}
                {session.loading && session.data !== undefined ? (
                  <div style={{ marginRight: 'var(--spacer-2)' }}>
                    <div
                      className="d-block spinner-sm spinner-border text-primary"
                      role="status"
                    >
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : null}
                {session.error === ApiFetchErrors.ConnectionFailure ? (
                  <div className="d-flex flex-row justify-content-center align-items-center">
                    <FaWifi className="text-danger" />
                    <p className="ms-2 text-danger mb-0">No Internet</p>
                  </div>
                ) : session.error === ApiFetchErrors.Aborted ? (
                  <div className="d-flex flex-row justify-content-center align-items-center">
                    <p className="ms-2 mb-0">Redirecting...</p>
                  </div>
                ) : session.error === ApiFetchErrors.UnexpectedResponse ? (
                  <div className="d-flex flex-row justify-content-center align-items-center">
                    <FaExclamationCircle className="text-danger" />
                    <p className="text-danger ms-2 mb-0">Unexpected Error</p>
                  </div>
                ) : null}
                {session.data !== undefined && !session.error ? (
                  <ul className="navbar-nav">
                    <>
                      {session.data ? (
                        <li className="nav-item d-flex justify-content-center my-2 my-lg-0">
                          <LinkAnchor
                            href={USER_ROUTE.getHref()}
                            className="btn btn-secondary"
                          >
                            <FaUser />
                          </LinkAnchor>
                        </li>
                      ) : (
                        <li className="nav-item">
                          <LinkAnchor
                            href={LOGIN_ROUTE.getHref({
                              next: getCurrentLocalHref(),
                            })}
                            className="nav-link"
                          >
                            Login
                          </LinkAnchor>
                        </li>
                      )}
                    </>
                  </ul>
                ) : null}
              </div>
            </Navbar.Collapse>
          </div>
        </Navbar>
      </header>
      {expanded ? (
        <div
          role="switch"
          onClick={() => {
            collapseMenu();
          }}
          onKeyUp={(e) => {
            if (e.code === 'Space') {
              collapseMenu();
            }
          }}
          className={styles['header__backdrop']}
          aria-checked={true}
          tabIndex={-1}
        />
      ) : null}
    </>
  );
}

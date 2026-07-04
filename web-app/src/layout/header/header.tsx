import React from 'react';
import { useEffect, useState } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import * as styles from './header.module.scss';
import { LinkAnchor } from '../../ui/link-anchor';
import { PROJECT_NAME } from '../../project-details';
import { FaBars, FaUser } from 'react-icons/fa';
import {
  CommunicatedDataGate,
  CommunicatedDataGateLayout,
} from '../../ui/communicated-data-gate';
import { LANDS_ROUTE } from '../../client/lands/lands-routes';
import { USER_ROUTE } from '../../client/user/user-routes';
import { INDEX_ROUTE } from '../../index-template/index-routes';
import { LOGIN_ROUTE } from '../../client/login/login-routes';
import { getCurrentLocalHref } from '../../navigation/current-local-href';
import { HELP_ROUTE } from '../../help/help-routes';
import { CLIENT_SIDE_INDEX_ROUTE } from '../../client/index/index-routes';
import logo from '../../../logo.svg'
import { useAuthenticationStateSession } from '../../users/authentication/authentication-state';

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

              <CommunicatedDataGate
                layout={CommunicatedDataGateLayout.Tape}
                dataWrapper={session}
                className="ms-auto"
              >
                {({ data }) => {
                  return (
                    <ul className="navbar-nav">
                      <>
                        {data ? (
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
                  );
                }}
              </CommunicatedDataGate>
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

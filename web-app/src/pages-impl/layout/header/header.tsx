import { useEffect, useState } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import * as styles from './header.module.scss';
import { LinkAnchor } from 'src/ui/link-anchor';
import { PROJECT_NAME } from '@shared/src/project-details';
import { faBars, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  TransportedDataGate,
  TransportedDataGateLayout,
} from 'src/ui/transported-data-gate';
import { LANDS_ROUTE } from 'src/pages-impl/client-side/lands/lands-routes';
import { useStoreSelector } from 'src/redux/use-store-selector';
import { mainApiReducer } from 'src/main-api/main-api-reducer';
import { USER_ROUTE } from 'src/pages-impl/client-side/user/user-routes';
import { INDEX_ROUTE } from 'src/pages-impl/index-template/index-routes';
import { LOGIN_ROUTE } from 'src/pages-impl/client-side/login/login-routes';
import { getCurrentLocalHref } from 'src/navigation/current-local-href';
import { HELP_ROUTE } from 'src/pages-impl/help/help-routes';
import { CLIENT_SIDE_INDEX_ROUTE } from 'src/pages-impl/client-side/index/index-routes';

type Props = {
  menuHtmlId: string;
  className: string;
};

/*
  TODO: add menu items
*/

export function Header(props: Props) {
  const [expanded, replaceExpanded] = useState<boolean>(false);

  const session = useStoreSelector(
    { mainApi: mainApiReducer },
    (s) => s.mainApi.session,
  );

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
        <Navbar collapseOnSelect expand="lg" expanded={expanded}>
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
              <FontAwesomeIcon icon={faBars} />
            </Navbar.Toggle>
            <LinkAnchor
              className="navbar-brand me-n3 me-lg-2"
              href={INDEX_ROUTE.getHref()}
            >
              <span className="h3">{PROJECT_NAME}</span>
              <span
                className="badge bg-warning p-1"
                style={{
                  position: 'relative',
                  right: '25px',
                  top: '1.25rem',
                  transform: 'rotate(-25deg)',
                  fontWeight: 100,
                }}
              >
                In the making
              </span>
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

              <TransportedDataGate
                layout={TransportedDataGateLayout.Tape}
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
                              className="btn btn-default"
                            >
                              <FontAwesomeIcon icon={faUser} />
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
              </TransportedDataGate>
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

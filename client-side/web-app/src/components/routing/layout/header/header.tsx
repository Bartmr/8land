import { useEffect, useState } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import * as styles from './header.module.scss';
import { LinkAnchor } from 'src/components/ui-kit/protons/link-anchor/link-anchor';
import { CLIENT_SIDE_INDEX_ROUTE } from 'src/components/templates/client-side/index/index-routes';
import { PROJECT_NAME } from '@app/shared/project-details';
import { missingCssClass } from 'src/components/ui-kit/core/utils/missing-css-class';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  TransportedDataGate,
  TransportedDataGateLayout,
} from 'src/components/shared/transported-data-gate/transported-data-gate';
import { LANDS_ROUTE } from 'src/components/templates/client-side/lands/lands-routes';
import { useStoreSelector } from 'src/logic/app-internals/store/use-store-selector';
import { mainApiReducer } from 'src/logic/app-internals/apis/main/main-api-reducer';
import { useMainApiSessionLogout } from 'src/logic/app-internals/apis/main/session/use-main-api-session-logout';
import { Role } from '@app/shared/auth/auth.enums';
import { TERRITORIES_ROUTE } from 'src/components/templates/client-side/territories/territories-routes';

type Props = {
  menuHtmlId: string;
  className: string;
};

/*
  TODO: add menu items
*/

export function Header(props: Props) {
  const [expanded, replaceExpanded] = useState<boolean>(false);

  const logout = useMainApiSessionLogout();
  const session = useStoreSelector(
    { mainApi: mainApiReducer },
    (s) => s.mainApi.session,
  );

  const onLogOutClick = async () => {
    const confirmed = window.confirm('Do you want to log out?');

    if (confirmed) {
      await logout.logout();
    }
  };

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
              className="navbar-brand me-0 me-lg-3"
              href={CLIENT_SIDE_INDEX_ROUTE.getHref()}
            >
              <span className="h5">{PROJECT_NAME}</span>
            </LinkAnchor>
            <Navbar.Collapse id={props.menuHtmlId}>
              <ul className="navbar-nav me-3 my-2 my-lg-0">
                <TransportedDataGate
                  layout={TransportedDataGateLayout.Tape}
                  dataWrapper={session}
                >
                  {({ data }) => {
                    return (
                      <>
                        {data ? (
                          data.role === Role.Admin ? (
                            <li className="nav-item">
                              <LinkAnchor
                                activeClassName="active"
                                className="nav-link"
                                href={LANDS_ROUTE.geHref()}
                              >
                                {LANDS_ROUTE.label}
                              </LinkAnchor>
                            </li>
                          ) : null
                        ) : null}
                        <li className="nav-item">
                          <LinkAnchor
                            activeClassName="active"
                            className="nav-link"
                            href={TERRITORIES_ROUTE.getHref()}
                          >
                            {TERRITORIES_ROUTE.title}
                          </LinkAnchor>
                        </li>
                      </>
                    );
                  }}
                </TransportedDataGate>
              </ul>

              <ul className="navbar-nav ms-auto">
                <TransportedDataGate
                  layout={TransportedDataGateLayout.Tape}
                  dataWrapper={session}
                >
                  {({ data }) => {
                    return (
                      <>
                        {data ? (
                          <li className="nav-item d-flex justify-content-end">
                            <button
                              onClick={onLogOutClick}
                              className="btn btn-default"
                            >
                              Log Out
                            </button>
                          </li>
                        ) : null}
                      </>
                    );
                  }}
                </TransportedDataGate>
              </ul>
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
          className={styles['header__backdrop'] || missingCssClass()}
          aria-checked={true}
          tabIndex={-1}
        />
      ) : null}
    </>
  );
}

import { useEffect, useState } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import * as styles from './header.module.scss';
import { LinkAnchor } from 'src/components/ui-kit/protons/link-anchor/link-anchor';
import { PROJECT_NAME } from '@app/shared/project-details';
import { missingCssClass } from 'src/components/ui-kit/core/utils/missing-css-class';
import { faBars, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  TransportedDataGate,
  TransportedDataGateLayout,
} from 'src/components/shared/transported-data-gate/transported-data-gate';
import { LANDS_ROUTE } from 'src/components/templates/client-side/lands/lands-routes';
import { useStoreSelector } from 'src/logic/app-internals/store/use-store-selector';
import { mainApiReducer } from 'src/logic/app-internals/apis/main/main-api-reducer';
import { Role } from '@app/shared/auth/auth.enums';
import { TERRITORIES_ROUTE } from 'src/components/templates/client-side/territories/territories-routes';
import { USER_ROUTE } from 'src/components/templates/client-side/user/user-routes';
import { INDEX_ROUTE } from 'src/components/templates/index-template/index-routes';

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
              className="navbar-brand me-0 me-lg-3"
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
              <TransportedDataGate
                layout={TransportedDataGateLayout.Tape}
                dataWrapper={session}
              >
                {({ data }) => {
                  return (
                    <ul className="navbar-nav me-3 my-2 my-lg-0">
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
                      {data ? (
                        <li className="nav-item">
                          <LinkAnchor
                            activeClassName="active"
                            className="nav-link"
                            href={TERRITORIES_ROUTE.getHref()}
                          >
                            {TERRITORIES_ROUTE.title}
                          </LinkAnchor>
                        </li>
                      ) : null}
                    </ul>
                  );
                }}
              </TransportedDataGate>

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
                            <LinkAnchor
                              href={USER_ROUTE.getHref()}
                              className="btn btn-default"
                            >
                              <FontAwesomeIcon icon={faUser} />
                            </LinkAnchor>
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

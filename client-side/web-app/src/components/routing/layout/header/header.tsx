import { useEffect, useState } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import * as styles from './header.module.scss';
import { LinkAnchor } from 'src/components/ui-kit/protons/link-anchor/link-anchor';
import { CLIENT_SIDE_INDEX_ROUTE } from 'src/components/templates/client-side/index/index-routes';
import { Nav } from 'react-bootstrap';
import { PROJECT_NAME } from '@app/shared/project-details';
import { missingCssClass } from 'src/components/ui-kit/core/utils/missing-css-class';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type Props = {
  menuHtmlId: string;
  className: string;
};

export function Header(props: Props) {
  const [expanded, replaceExpanded] = useState<boolean>(false);

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
              className="navbar-brand"
              href={CLIENT_SIDE_INDEX_ROUTE.getHref()}
            >
              <span className="badge badge-primary">
                <span className="h5">{PROJECT_NAME}</span>
              </span>
            </LinkAnchor>
            <Navbar.Collapse id={props.menuHtmlId}>
              <Nav>
                <li className="nav-item"></li>
              </Nav>
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
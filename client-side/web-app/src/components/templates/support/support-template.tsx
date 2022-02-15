import {
  faHandHolding,
  faPen,
  faProjectDiagram,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Layout } from 'src/components/routing/layout/layout';
import { LinkAnchor } from 'src/components/ui-kit/protons/link-anchor/link-anchor';
import { ABOUT_ROUTE } from './about/about-routes';
import { ACQUIRING_TERRITORIES_ROUTE } from './acquiring-territories/acquiring-territories-routes';
import { HOW_TO_EDIT_TERRITORY_ROUTE } from './edit-territory/edit-territory-routes';
import { SUPPORT_ROUTE } from './support-routes';

export const SupportTemplate = () => {
  return (
    <Layout title={SUPPORT_ROUTE.title}>
      {() => (
        <div>
          <h2>Support</h2>
          <div className="row g-3">
            {[
              {
                icon: <FontAwesomeIcon icon={faHandHolding} />,
                title: 'How to acquire territory?',
                href: ACQUIRING_TERRITORIES_ROUTE.getHref(),
              },
              {
                icon: <FontAwesomeIcon icon={faPen} />,
                title: 'How to edit my territory?',
                href: HOW_TO_EDIT_TERRITORY_ROUTE.getHref(),
              },
              {
                icon: <FontAwesomeIcon icon={faProjectDiagram} />,
                title: 'About 8Land',
                href: ABOUT_ROUTE.getHref(),
                color: 'info',
              },

              // TODO Report bug
              // TODO Get help
            ].map((c) => {
              return (
                <div key={c.title} className="col-6 col-md-4">
                  <div
                    className={`h-100 d-block text-center bg-${
                      c.color || 'lightest'
                    }`}
                  >
                    <LinkAnchor
                      href={c.href}
                      className="h-100 link-unstyled selectable d-block p-3"
                    >
                      <div className="icon-badge mb-2">{c.icon}</div>
                      {c.title}
                    </LinkAnchor>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Layout>
  );
};

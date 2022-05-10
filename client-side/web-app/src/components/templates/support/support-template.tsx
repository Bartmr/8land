import { CONTACT_CTA_PRESENT } from '@app/shared/project-details';
import {
  faHandHolding,
  faLightbulb,
  faPen,
  faProjectDiagram,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Layout } from 'src/components/routing/layout/layout';
import { LinkAnchor } from 'src/components/ui-kit/protons/link-anchor/link-anchor';
import { ABOUT_ROUTE } from './about/about-routes';
import { ACQUIRING_TERRITORIES_ROUTE } from './acquiring-territories/acquiring-territories-routes';
import { HOW_TO_EDIT_TERRITORY_ROUTE } from './edit-territory/edit-territory-routes';
import { LAND_IDEAS_ROUTE } from './land-ideas/land-ideas-routes';
import { SUPPORT_ROUTE } from './support-routes';

export const SupportTemplate = () => {
  return (
    <Layout title={SUPPORT_ROUTE.title}>
      {() => (
        <div>
          <h2>Support</h2>
          <hr />

          <div>
            <h3>Collectibles and NFT Territories</h3>
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
              ].map((c) => {
                return (
                  <div key={c.title} className="col-6 col-md-4">
                    <div
                      className={`h-100 d-block text-center bg-${'lightest'}`}
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
          <hr />

          <div>
            <h3>Lands</h3>
            <div className="row g-3">
              {[
                {
                  icon: <FontAwesomeIcon icon={faLightbulb} />,
                  title: LAND_IDEAS_ROUTE.title,
                  href: LAND_IDEAS_ROUTE.getHref(),
                },
              ].map((c) => {
                return (
                  <div key={c.title} className="col-6 col-md-4">
                    <div
                      className={`h-100 d-block text-center bg-${'lightest'}`}
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
          <hr />

          <div>
            <h3>Other</h3>
            {[
              {
                icon: <FontAwesomeIcon icon={faProjectDiagram} />,
                title: 'About 8Land',
                href: ABOUT_ROUTE.getHref(),
                color: 'info',
              },
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

            <div className="mt-4">
              <p>
                For individual support,{' '}
                <span
                  dangerouslySetInnerHTML={{ __html: CONTACT_CTA_PRESENT }}
                ></span>
              </p>
              <p>
                To report a bug,{' '}
                <span
                  dangerouslySetInnerHTML={{ __html: CONTACT_CTA_PRESENT }}
                ></span>
              </p>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

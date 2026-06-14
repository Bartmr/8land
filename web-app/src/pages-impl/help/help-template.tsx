import React from 'react';
import { CONTACT_CTA_PRESENT } from '../../project-details';
import { FaLightbulb, FaProjectDiagram } from 'react-icons/fa';
import { FaPenRuler } from 'react-icons/fa6';
import { Layout } from '../layout/layout';
import { LinkAnchor } from '../../ui/link-anchor';
import { ABOUT_ROUTE } from './about/about-routes';
import { LAND_IDEAS_ROUTE } from './lands/land-ideas/land-ideas-routes';
import { BUILDING_A_LAND_ROUTE } from './lands/building-a-land/building-a-land.routes';

export const HelpTemplate = () => {
  return (
    <Layout>
      {() => (
        <div>
          <h2>Help</h2>
          <hr />

        

          <div>
            <h3>Lands</h3>
            <div className="row g-3">
              {[
                {
                  icon: <FaLightbulb />,
                  title: LAND_IDEAS_ROUTE.title,
                  href: LAND_IDEAS_ROUTE.getHref(),
                },
                {
                  icon: <FaPenRuler />,
                  title: BUILDING_A_LAND_ROUTE.title,
                  href: BUILDING_A_LAND_ROUTE.getHref(),
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

            <div className="col-6 col-md-4">
              <div
                className={`h-100 d-block text-center`}
              >
                <LinkAnchor
                  href={ABOUT_ROUTE.getHref()}
                  className="h-100 selectable d-block p-3"
                >
                  <div className="icon-badge mb-2"><FaProjectDiagram /></div>
                  About 8Land
                </LinkAnchor>
              </div>
            </div>


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

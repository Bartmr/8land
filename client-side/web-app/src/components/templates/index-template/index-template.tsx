import { PROJECT_SLOGAN, TWITTER_URL } from '@app/shared/project-details';
import { faTwitter } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Layout } from 'src/components/routing/layout/layout';
import { LinkAnchor } from 'src/components/ui-kit/protons/link-anchor/link-anchor';
import { CLIENT_SIDE_INDEX_ROUTE } from '../client-side/index/index-routes';
import { LANDS_ROUTE } from '../client-side/lands/lands-routes';
import { INDEX_ROUTE } from './index-routes';

export function IndexTemplate() {
  return (
    <Layout noContainment title={INDEX_ROUTE.label}>
      {() => (
        <>
          <div
            className="container d-flex flex-column justify-content-center"
            style={{ height: '80vh' }}
          >
            <div className="pb-4 d-flex flex-column align-items-center">
              <div className="d-flex align-items-center">
                <h1 className="display-1">8Land</h1>

                <div>
                  <div
                    style={{
                      fontSize: '1.5rem',
                      position: 'absolute',
                    }}
                    className="mt-n2"
                  >
                    <LinkAnchor className="ms-3 my-2" href={TWITTER_URL}>
                      <FontAwesomeIcon icon={faTwitter} />
                    </LinkAnchor>
                  </div>
                </div>
              </div>
              <div className="bg-secondary">
                <p className="mb-0 display-4 text-body text-center">
                  {PROJECT_SLOGAN}
                </p>
              </div>
              <hr style={{ width: '3rem' }}></hr>
              <div className="mt-3 w-100 row g-2 justify-content-center">
                <div className="col-12 col-md-4 col-lg-3">
                  <LinkAnchor
                    className="d-block btn btn-default"
                    href={LANDS_ROUTE.getHref()}
                  >
                    Start building lands
                  </LinkAnchor>
                </div>
                <div className="col-12 col-md-5 col-lg-3">
                  <LinkAnchor
                    className="d-block btn btn-primary"
                    href={CLIENT_SIDE_INDEX_ROUTE.getHref()}
                  >
                    Explore it{' '}
                    <span className="small">(No login required)</span>
                  </LinkAnchor>
                </div>
              </div>
            </div>
          </div>
          <hr />
          <div className="bg-secondary py-5">
            <div className="container">
              <p className="display-3 text-body">
                An artwork to explore and relax
                <br />
                <span className="display-4 text-body">
                  8Land is an ever evolving game that tries to retain the
                  simplicity of old-school RPGs.
                </span>
              </p>
              <p className="mt-4">
                {
                  "It's open enough for people to build their own pixelised world, \
but simple enough for anyone to just explore aimlessly, like we \
did with old RPG games."
                }
              </p>
            </div>
          </div>
          <div
            style={{ backgroundColor: '#0000ff' }}
            className="with-light-contrasting-colors py-5"
          >
            <div className="container">
              <p className="display-4 text-secondary">
                3D realstate in the metaverse is hard or takes too long to
                build?
                <br />
                <span className="display-3 text-body">
                  Well, build your 2D lands in a single afternoon
                </span>
              </p>
              <p className="mt-4">
                Sketching in 2D is faster than conceptualizing in 3D.
                <br />
                Just by drawing pixelart and laying it out on a map, you can
                start your own tiny world in no time.
              </p>
            </div>
          </div>
          <div className="py-5">
            <div className="container text-center">
              <p className="display-4 text-white">
                What are you waiting for?
                <br />
              </p>
              <LinkAnchor
                className="btn btn-primary"
                href={CLIENT_SIDE_INDEX_ROUTE.getHref()}
              >
                Dive in!
              </LinkAnchor>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}

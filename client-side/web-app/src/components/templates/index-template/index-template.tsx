import { PROJECT_SLOGAN } from '@app/shared/project-details';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Layout } from 'src/components/routing/layout/layout';
import { LinkAnchor } from 'src/components/ui-kit/protons/link-anchor/link-anchor';
import { EnvironmentVariables } from 'src/logic/app-internals/runtime/environment-variables';
import { CLIENT_SIDE_INDEX_ROUTE } from '../client-side/index/index-routes';
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
              <h1 className="display-1">8Land</h1>
              <div className="bg-secondary">
                <p className="mb-0 display-4 text-body text-center">
                  {PROJECT_SLOGAN}
                </p>
              </div>
              <hr style={{ width: '3rem' }}></hr>
              <p className="text-center">
                8Land is a 2D pixelart metaverse where people build their own
                RPG-like territories
                {/* TODO enable when indoors are built <br /> and indoors */}
              </p>
              <div className="mt-3 w-100 row g-2 justify-content-center">
                <div className="col-12 col-md-4 col-lg-3">
                  <LinkAnchor
                    className="d-block btn btn-default"
                    href={EnvironmentVariables.TERRITORIES_STORE_URL}
                  >
                    Own Territory (NFTs)
                  </LinkAnchor>
                </div>
                <div className="col-12 col-md-5 col-lg-4">
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
                  8Land is an ever evolving piece of art that tries to retain
                  the simplicity of old-school RPGs.
                </span>
              </p>
              <p className="mt-4">
                People can acquire territory throught NFTs and build their own
                part in this group art piece.
                <br />
                {
                  "It's open enough for people to build their own pixelised world,\
but simple enough for anyone to just explore aimlessly, like we\
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
                  Well, build your 2D territory in a single afternoon
                </span>
              </p>
              <p className="mt-4">
                Sketching in 2D is faster than conceptualizing in 3D.
                <br />
                Just by drawing pixelart and laying it out on a map, you can
                position yourself in the metaverse in no time.
              </p>

              <p>
                And the best part,{' '}
                <span style={{ textDecoration: 'underline' }}>
                  no code needed!
                </span>
              </p>
              <div>
                <p
                  style={{ textDecoration: 'underline' }}
                  className="mt-4 display-4 text-body text-end"
                >
                  8Land keeps it simple, just like nostalgy
                </p>
              </div>
            </div>
          </div>
          <div
            style={{ backgroundColor: '#198754' }}
            className="with-light-contrasting-colors py-5"
          >
            <div className="container">
              <p className="display-4 text-body">
                Art first, tokenomics second
              </p>
              <p className="mt-4">
                8Land uses NFTs as a way for distributing and exchanging
                territories.
              </p>
            </div>
          </div>
          <div className="bg-danger py-5">
            <div className="container">
              <p className="display-4 text-body">
                The metaverse, for everyone anywhere
              </p>
              <p className="mt-4">
                Contrary to most metaverses which can only run in powerful
                desktops and VR headsets, 8Land was made to run anywhere, from
                your phone to your desktop.
              </p>
              <p>---</p>
              <p>
                8Land also does not require a crypto wallet, so that both crypto
                and non-crypto users can enjoy the metaverse.
              </p>

              <p>You will only need a wallet to buy and manage territories.</p>
            </div>
          </div>
          <div
            style={{ backgroundColor: '#ffc107' }}
            className="with-dark-contrasting-colors py-5"
          >
            <div className="container">
              <p className="display-4 text-body">The Roadmap</p>
              <ul className="mt-4">
                <li>
                  First Release <FontAwesomeIcon icon={faCheck} />
                </li>
                <li>Territory owners can build their own explorable indoors</li>
                <li>Release new lands on a regular basis</li>
                <li>
                  Create a developer API so anyone can create games and
                  interactive screens
                </li>
              </ul>
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

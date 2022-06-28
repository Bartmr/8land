import { Layout } from 'src/components/routing/layout/layout';
import { LinkAnchor } from 'src/components/ui-kit/protons/link-anchor/link-anchor';
import { ABOUT_ROUTE } from './about-routes';
import raribleLogo from './rarible-logo.svg';
import tiledLogo from './tiled-logo-white.png';
import soundcloudLogo from './soundcloud-logo.png';
import bart from './bart.jpg';
import painting1 from './painting-1.jpg';
import painting2 from './painting-2.jpg';

export function AboutTemplate() {
  return (
    <Layout title={ABOUT_ROUTE.title}>
      {() => (
        <>
          <div className="card">
            <div className="card-body">
              <h2 className="card-title h4">Special Thanks</h2>
              <div className="row g-3 align-items-center mb-4">
                <div className="col-3 col-md-2 col-lg-1">
                  <img src={tiledLogo} width={'100%'} alt={'Tiled'} />
                </div>
                <div className="col-9 col-md-10 col-lg-11">
                  <p className="mb-0">
                    <LinkAnchor href={'https://www.mapeditor.org/'}>
                      Tiled, map editor
                    </LinkAnchor>{' '}
                    for it&apos;s software that allows anyone to quickly create
                    territory and land maps
                  </p>
                </div>
              </div>
              <div className="row g-3 d-flex align-items-center mb-4">
                <div className="col-3 col-md-2 col-lg-1">
                  <img src={soundcloudLogo} width={'100%'} alt={'Soundcloud'} />
                </div>
                <div className="col-9 col-md-10 col-lg-11">
                  <p className="mb-0">
                    <LinkAnchor href={'https://soundcloud.com/'}>
                      Soundcloud
                    </LinkAnchor>{' '}
                    as source and player of background music
                  </p>
                </div>
              </div>
              <div className="row g-3 align-items-center">
                <div className="col-3 col-md-2 col-lg-1">
                  <img src={raribleLogo} width={'80%'} alt={'Rarible'} />
                </div>
                <div className="col-9 col-md-10 col-lg-11">
                  <p className="mb-0">
                    <LinkAnchor href={'https://rarible.com/'}>
                      Rarible
                    </LinkAnchor>{' '}
                    for making it easy to sell, manage and authenticate 8Land
                    NFTs
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <h2>About 8Land</h2>
            <div className="mb-3 d-flex row g-3 align-items-center justify-content-center">
              <div className="col-6 col-md-2">
                <img
                  className="rounded-circle shadow-sm"
                  src={bart}
                  width={'100%'}
                  alt="Bartolomeu Rodrigues"
                />
              </div>
              <div className="col-12 col-md-10">
                <p className="mb-0">
                  8Land was created by me,{' '}
                  <LinkAnchor href={'https://bartolomeu-rodrigues.com/'}>
                    Bartolomeu Rodrigues
                  </LinkAnchor>
                  . I&apos;m a full-stack developer and oldtime wanna-be artist.
                </p>
              </div>
              <div className="mt-4">
                <p>
                  8Land came from my the need to create surreal spaces on paper,
                  and also from the nostalgy I felt with RPGs like
                  Pok&eacute;mon. I wanted something that could be endlessly
                  explored, endlessly created... but have that feeling I felt
                  whenever I played handheld consoles back in the day.
                </p>
                <p>
                  8Land is built torwards creating a simple and relaxing space,
                  where you can discover new places and new songs without having
                  any objective. Just exploring...
                </p>
              </div>
              <div className="mx-auto row g-3 justify-content-center">
                <div className="col-12 col-md-6">
                  <LinkAnchor openInNewTab href={painting1}>
                    <img src={painting1} alt={'painting 1'} width={'100%'} />
                  </LinkAnchor>
                </div>
                <div className="col-12 col-md-6">
                  <LinkAnchor openInNewTab href={painting2}>
                    <img src={painting2} alt={'painting 2'} width={'100%'} />
                  </LinkAnchor>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}

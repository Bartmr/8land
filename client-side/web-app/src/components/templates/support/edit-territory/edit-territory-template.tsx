import { TERRITORY_TILESET_SIZE_LIMIT } from '@app/shared/territories/edit/edit-territory.constants';
import { Layout } from 'src/components/routing/layout/layout';
import { LinkAnchor } from 'src/components/ui-kit/protons/link-anchor/link-anchor';
import { TERRITORIES_ROUTE } from '../../client-side/territories/territories-routes';
import { ACQUIRING_TERRITORIES_ROUTE } from '../acquiring-territories/acquiring-territories-routes';
import { HOW_TO_EDIT_TERRITORY_ROUTE } from './edit-territory-routes';

import gimpImg1 from './tileset/image-1.jpg';
import gimpImg2 from './tileset/image-2.jpg';
import gimpImg3 from './tileset/image-3.jpg';
import gimpImg4 from './tileset/image-4.jpg';
import gimpImg5 from './tileset/image-5.jpg';
import gimpImg6 from './tileset/image-6.jpg';
import gimpImg7 from './tileset/image-7.jpg';

import tiledImg1 from './map/image-1.png';
import tiledImg2 from './map/image-2.png';
import tiledImg3 from './map/image-3.png';
import tiledImg4 from './map/image-4.png';
import tiledImg5 from './map/image-5.png';
import tiledImg6 from './map/image-6.png';
import tiledImg7 from './map/image-7.png';
import tiledImg8 from './map/image-8.png';
import tiledImg9 from './map/image-9.png';
import tiledImg10 from './map/image-10.png';

export function HowToEditTerritoryTemplate() {
  return (
    <Layout title={HOW_TO_EDIT_TERRITORY_ROUTE.title}>
      {() => (
        <>
          <style>{`
          .tutorial-list > li {
            margin-top: calc(var(--spacer-4) / 2);
            padding-bottom: calc(var(--spacer-4) / 2);
          }

          .tutorial-list > li:not(:last-child) {
            border-bottom: var(--border);
          }
          `}</style>
          <h2>Editing a territory</h2>
          <div className="alert alert-info" role="alert">
            In order to edit a territory, you must first own a territory. You
            can check how to get one{' '}
            <LinkAnchor
              className="alert-link"
              href={ACQUIRING_TERRITORIES_ROUTE.getHref()}
            >
              here
            </LinkAnchor>
          </div>
          <ol className="tutorial-list">
            <li>
              In 8Land, a territory is composed of
              <ul>
                <li>
                  a PNG picture containing tiles that represents how your
                  territory will look{' '}
                  <span className="font-italic">(called a tileset)</span>
                </li>
                <li>
                  and a JSON map file that lays out said tiles and their
                  interactions with the land
                </li>
              </ul>
              <p style={{ textDecoration: 'underline' }} className="mt-3">
                No code is needed for building up a territory.
              </p>
              <p>
                For drawing the tileset, you can use any image editor you like,
                but for the examples we&apos;ll be using{' '}
                <LinkAnchor href={'https://www.gimp.org/'}>
                  GIMP, an open source image editor.
                </LinkAnchor>
              </p>
              <p>
                For laying out our tileset in a map and assign some
                interactions, we&apos;ll be using{' '}
                <LinkAnchor href={'https://www.mapeditor.org/'}>
                  Tiled, the map editor
                </LinkAnchor>
                .
              </p>
            </li>
            <li>
              Let&apos;s start by creating our territory looks.
              <p>
                8Land is composed of multiple squares, each 16 by 16 pixels.
              </p>
              <p className="lead">
                Before starting, you should check your territory size{' '}
                <LinkAnchor href={TERRITORIES_ROUTE.getHref()}>here</LinkAnchor>
              </p>
              <p>
                So, if your territory is 5 by 4 squares, it means we&apos;ll be
                needing an initial tileset of 5*16px and 4*16px, which is 80x64.
                <br />
                So let&apos;s create our tileset in GIMP
              </p>
              <p>
                <LinkAnchor
                  openInNewTab
                  className="w-75 d-block"
                  href={gimpImg1}
                >
                  <img src={gimpImg1} alt={'screenshot'} width={'100%'} />
                </LinkAnchor>
              </p>
              <p>
                <LinkAnchor
                  openInNewTab
                  className="w-50 d-block"
                  href={gimpImg2}
                >
                  <img src={gimpImg2} alt={'screenshot'} width={'100%'} />
                </LinkAnchor>
              </p>
            </li>
            <li>
              <p>
                You might want to get a grid to help you to draw each
                tile/square in your territory. Here are the steps to do it:
              </p>
              <p>
                <LinkAnchor
                  openInNewTab
                  className="w-75 d-block"
                  href={gimpImg3}
                >
                  <img src={gimpImg3} alt={'screenshot'} width={'100%'} />
                </LinkAnchor>
              </p>
              <p>
                <LinkAnchor
                  openInNewTab
                  className="w-25 d-block"
                  href={gimpImg4}
                >
                  <img src={gimpImg4} alt={'screenshot'} width={'100%'} />
                </LinkAnchor>
              </p>
              <p>
                <LinkAnchor
                  openInNewTab
                  className="w-75 d-block"
                  href={gimpImg5}
                >
                  <img src={gimpImg5} alt={'screenshot'} width={'100%'} />
                </LinkAnchor>
              </p>
            </li>
            <li>
              <p>
                In order to keep the game fast in any platform, we&apos;ve
                limited the tilesets file size to{' '}
                {TERRITORY_TILESET_SIZE_LIMIT / 1000} KB.
                <br />
                We might allow more in the future, but for now you can cut most
                of the file size by converting the tileset colors to
                &quot;Indexed Mode&quot;. Here&apos;s how you can do that with
                GIMP:
              </p>
              <p>
                <LinkAnchor
                  openInNewTab
                  className="w-75 d-block"
                  href={gimpImg6}
                >
                  <img src={gimpImg6} alt={'screenshot'} width={'100%'} />
                </LinkAnchor>
              </p>
              <p>
                <LinkAnchor
                  openInNewTab
                  className="w-50 d-block"
                  href={gimpImg7}
                >
                  <img src={gimpImg7} alt={'screenshot'} width={'100%'} />
                </LinkAnchor>
              </p>
            </li>
            <li>
              <p>
                Now that we&apos;ve got our tileset done, it&apos;s time to lay
                it out on a map with Tiled, the map editor.
                <br /> Let&apos;s open Tiled and create a new map
              </p>
              <p>
                <LinkAnchor
                  openInNewTab
                  className="w-75 d-block"
                  href={tiledImg1}
                >
                  <img src={tiledImg1} alt={'screenshot'} width={'100%'} />
                </LinkAnchor>
              </p>
              <p>
                <LinkAnchor
                  openInNewTab
                  className="w-75 d-block"
                  href={tiledImg2}
                >
                  <img src={tiledImg2} alt={'screenshot'} width={'100%'} />
                </LinkAnchor>
              </p>
            </li>
            <li>
              <p>
                This time, you can put the 8Land territory dimensions as width
                and height, but you need to set the tile size to 16x16 px
              </p>
              <p>
                <LinkAnchor
                  openInNewTab
                  className="w-50 d-block"
                  href={tiledImg3}
                >
                  <img src={tiledImg3} alt={'screenshot'} width={'100%'} />
                </LinkAnchor>
              </p>
            </li>
            <li>
              <p>
                Our map file is created. Let&apos;s now import our tileset into
                the map, and add some interactions
              </p>
              <p>
                <LinkAnchor
                  openInNewTab
                  className="w-75 d-block"
                  href={tiledImg4}
                >
                  <img src={tiledImg4} alt={'screenshot'} width={'100%'} />
                </LinkAnchor>
              </p>
              <p>
                <LinkAnchor
                  openInNewTab
                  className="w-50 d-block"
                  href={tiledImg5}
                >
                  <img src={tiledImg5} alt={'screenshot'} width={'100%'} />
                </LinkAnchor>
              </p>
              <p>
                <LinkAnchor
                  openInNewTab
                  className="w-75 d-block"
                  href={tiledImg6}
                >
                  <img src={tiledImg6} alt={'screenshot'} width={'100%'} />
                </LinkAnchor>
              </p>
            </li>
            <li>
              <p>
                We don&apos;t want our players walking over our building, so
                we&apos;ll be adding some collisions, that will stop the user
                from walking further.
              </p>
              <p>
                With the Ctrl key pressed, let&apos;s select the blocks that we
                want to make &quot;solid&quot;.
              </p>
              <p>
                <LinkAnchor
                  openInNewTab
                  className="w-75 d-block"
                  href={tiledImg7}
                >
                  <img src={tiledImg7} alt={'screenshot'} width={'100%'} />
                </LinkAnchor>
              </p>
            </li>
            <li>
              <p>
                Interactions are set by adding properties to the tiles in our
                tileset. To make a tile &quot;solid&quot;, we add a property
                named{' '}
                <span style={{ textDecoration: 'underline' }}>collides</span>{' '}
                and set it to true.
              </p>
              <div className="card my-4">
                <div className="card-body">
                  <p>
                    You can add many types of properties to a tile. Here is the
                    complete list:
                  </p>

                  <ul>
                    <li>
                      <span className="fst-italic">
                        collides/<span className="text-success">boolean</span>
                      </span>
                      : make the tile solid and block the player from walking
                      over it
                    </li>
                    <li>
                      <span className="fst-italic">
                        text/<span className="text-success">string</span>
                      </span>
                      : when the player is facing the tile and presses the
                      action button, the text will appear
                    </li>
                  </ul>
                </div>
              </div>
              <p>
                <LinkAnchor
                  openInNewTab
                  className="w-75 d-block"
                  href={tiledImg8}
                >
                  <img src={tiledImg8} alt={'screenshot'} width={'100%'} />
                </LinkAnchor>
              </p>
              <p>
                <LinkAnchor
                  openInNewTab
                  className="w-75 d-block"
                  href={tiledImg9}
                >
                  <img src={tiledImg9} alt={'screenshot'} width={'100%'} />
                </LinkAnchor>
              </p>
            </li>
            <li>
              <p>
                Now it&apos;s time to place the tiles in your territory. Pick a
                tile (or many) from the right sidebar, and click on the squares
                where you want to place the selected tiles
              </p>
              <p>
                <LinkAnchor
                  openInNewTab
                  className="w-75 d-block"
                  href={tiledImg10}
                >
                  <img src={tiledImg10} alt={'screenshot'} width={'100%'} />
                </LinkAnchor>
              </p>
            </li>
            <li>
              <p>
                After you finished all these steps, it&apos;s time to upload the
                tileset and the map.
              </p>
              <p>
                Just go to your{' '}
                <LinkAnchor
                  className="alert-link"
                  href={TERRITORIES_ROUTE.getHref()}
                >
                  territory page
                </LinkAnchor>{' '}
                and upload your files in the asset section. That&apos;s it!
                Enjoy your new presence in the metaverse!
              </p>
            </li>
          </ol>
        </>
      )}
    </Layout>
  );
}

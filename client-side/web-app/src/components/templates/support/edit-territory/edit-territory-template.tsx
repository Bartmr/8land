import { TERRITORY_TILESET_SIZE_LIMIT } from '@app/shared/territories/edit/edit-territory.constants';
import { Layout } from 'src/components/routing/layout/layout';
import { LinkAnchor } from 'src/components/ui-kit/protons/link-anchor/link-anchor';
import { TERRITORIES_ROUTE } from '../../client-side/territories/territories-routes';
import { ACQUIRING_TERRITORIES_ROUTE } from '../acquiring-territories/acquiring-territories-routes';
import { HOW_TO_EDIT_TERRITORY_ROUTE } from './edit-territory-routes';

export function HowToEditTerritoryTemplate() {
  return (
    <Layout title={HOW_TO_EDIT_TERRITORY_ROUTE.title}>
      {() => (
        <>
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
          <ol>
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
            </li>
            <li>
              In order to keep the game fast in any platform, we&apos;ve limited
              the tilesets file size to {TERRITORY_TILESET_SIZE_LIMIT / 1000}{' '}
              KB.
              <br />
              We might allow more in the future, but for now you can cut most of
              the file size by converting the tileset colors to &quot;Indexed
              Mode&quot;. Here&apos;s how you can do that with GIMP:
            </li>
          </ol>
        </>
      )}
    </Layout>
  );
}

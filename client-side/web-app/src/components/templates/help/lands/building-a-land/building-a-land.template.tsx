import { Layout } from 'src/components/routing/layout/layout';
import { LinkAnchor } from 'src/components/ui-kit/protons/link-anchor/link-anchor';
import { BUILDING_A_LAND_ROUTE } from './building-a-land.routes';
import landWithGrid from './images/land-with-grid.png';
import colorShades from './images/4-color-shades.png';

export function BuildingALandTemplate() {
  return (
    <Layout title={BUILDING_A_LAND_ROUTE.title}>
      {() => {
        return (
          <>
            <style>
              {`
          #building-a-land-steps li {
            margin-bottom: 1rem;
          }
          `}
            </style>
            <h1>{BUILDING_A_LAND_ROUTE.title}</h1>
            <ol id="building-a-land-steps">
              <li>
                {"For building a land, we're going to need:"}
                <ul>
                  <li>
                    An image editor like Photoshop or GIMP, to draw our pixelart
                    land
                  </li>
                  <li>
                    <LinkAnchor href="https://www.mapeditor.org/">
                      Tiled
                    </LinkAnchor>
                    {
                      ", a map editor, that we're going to use to add interactivity to our land"
                    }
                  </li>
                </ul>
              </li>
              <li>
                <p>
                  {
                    "To draw our land, we're going to create a new PNG image. Decide how big your land will be by how many steps a user can walk in it, horizontally and vertically. \
Now multiply the horizontal steps and vertical steps by 16, which is how many pixels each step has. \
In the example below, a player can walk 10 steps horizontally and 9 steps vertically, meaning the picture dimensions are 160 by 144 pixels."
                  }
                </p>
                <p>
                  <img
                    src={landWithGrid}
                    alt="Land with grid"
                    height={'400px'}
                  />
                </p>
                <p>
                  {
                    "If you're new to pixelart, we recommend you to setup some kind of 16 by 16 pixel grid in your image editor, and only use 4 shades of a given color, like the example below:"
                  }
                </p>
                <p>
                  <img
                    src={colorShades}
                    alt="4 color shades"
                    className="border"
                    height={'72px'}
                  />
                </p>
              </li>
              <li>
                <p>{"Now it's time to add some interactivity to our land"}</p>
                <p>
                  Lands have <span className="fw-bold">blocks</span> that fire
                  actions when a user steps on them or interacts with them.
                </p>
              </li>
            </ol>
          </>
        );
      }}
    </Layout>
  );
}

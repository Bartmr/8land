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
                  Lands have <span>blocks</span> that fire actions when a user
                  steps on them or interacts with them.
                </p>
                <p>There are two types of blocks:</p>

                <div>
                  <div>
                    <h2>Dynamic blocks</h2>
                    <p>
                      {
                        'They are created in the "Edit Land" page, which in turn gives you an ID to set in Tiled.'
                      }
                    </p>
                    <ul>
                      <li>
                        <span className="text-secondary">Door blocks</span>:
                        when the user steps on a door block, he walks into the
                        land that was assigned to said block.
                        <br />
                        A door block should be used as an entrance and also as
                        an exit, by reusing the door block id in the other land.
                        <br />{' '}
                        {
                          'You can see which doors are available as exits in the "Edit Land" page, under "Door Blocks pointing to this land"'
                        }
                      </li>
                      <li>
                        <span className="text-secondary">App blocks</span>:
                        These blocks open a given URL with an 8Land app, when
                        the user is facing torwards the block and interacts with
                        it
                      </li>
                    </ul>
                  </div>
                </div>
                <div>
                  <h2>Static blocks</h2>
                  <p>
                    {
                      "These are blocks don't need to be created first, and that can be directly set in Tiled"
                    }
                  </p>
                  <ul>
                    <li>
                      <span className="text-primary">{'collides'}</span>: a
                      boolean property that makes the block solid and stops the
                      user from getting past it.
                    </li>
                    <li>
                      <span className="text-primary">{'text'}</span>: a string
                      property that opens a text dialog when the user is facing
                      torwards the block and interacts with it.
                      <br />
                      Text is limited to 255 characters
                    </li>
                    <li>
                      <span className="text-primary">{'start'}</span>: this is
                      the block where the user will be dropped to when he
                      travels to your lands. It is also the block that allows
                      him to leave your lands, back to the train station.
                      <br />
                      This block should only be set in the first land that you
                      created. After the user lands on your{' '}
                      <span className="text-primary">start</span> block, he will
                      then travel to your other lands by using the{' '}
                      <span className="text-secondary">Door blocks.</span>
                      <br />
                      After you you upload a map with a{' '}
                      <span className="text-primary">start</span>
                      {
                        ' block into the first land you created, you will see "start" tag on the side of it\'s name.'
                      }
                    </li>
                  </ul>
                </div>
              </li>
            </ol>
          </>
        );
      }}
    </Layout>
  );
}

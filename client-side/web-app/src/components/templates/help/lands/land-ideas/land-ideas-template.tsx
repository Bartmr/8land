import { Layout } from 'src/components/routing/layout/layout';
import { LAND_IDEAS_ROUTE } from './land-ideas-routes';

export function LandIdeasTemplate() {
  return (
    <Layout title={LAND_IDEAS_ROUTE.title}>
      {() => {
        return (
          <>
            <h1>Land Ideas</h1>
            <ul>
              <li>Present your physical / online store and its products</li>
              <li>Showcase your art as an interactive gallery</li>
              <li>
                Promote your songs as background music, and with some
                interactive visuals
              </li>
              <li>Promotional games and contests</li>
              <li>An adventure game</li>
              <li>Mini-game arcade</li>
              <li>
                A gamified utility center (like a whole land dedicated to
                cryptocurrency tooling and information)
              </li>
              <li>Live forum</li>
              <li>{'Your own zen space'}</li>
              <li>Virtual pet sitting / tamagotchi</li>
              <li>Virtual items exchange</li>
              <li>
                {
                  "Show a miniature version of your company's office to potencial candidates, with cool facts and interactive games"
                }
              </li>

              <li>
                {
                  'Show your non-profit organization or cause in an interactive manner'
                }
              </li>

              <li>{'Diorama - teach something interactively'}</li>

              {/* TODO <li>{'An escape room'}</li> */}

              <li>
                {
                  'Show a miniature version of your office to candidates, with trivea and quirky facts about the company'
                }
              </li>
              <li>{"Create arcades for the games you've developed"}</li>
            </ul>
          </>
        );
      }}
    </Layout>
  );
}

import { GetLandDTO } from '@app/shared/land/get/get-land.dto';
import { faMusic } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { missingCssClass } from 'src/components/ui-kit/core/utils/missing-css-class';
import { LinkAnchor } from 'src/components/ui-kit/protons/link-anchor/link-anchor';
import { MainApiSessionData } from 'src/logic/app-internals/apis/main/session/main-api-session-types';
import { getCurrentLocalHref } from 'src/logic/app-internals/navigation/get-current-local-href';
import { LOGIN_ROUTE } from '../../login/login-routes';
import { LandScreen } from './components/screens/land/land-screen';
import { Keypad } from './components/keypad';
import { MusicTicker } from './components/music-ticker';
import * as styles from './game-frame.module.scss';

export function GameFrame(props: {
  land: GetLandDTO;
  session: null | MainApiSessionData;
}) {
  const [musicUrl, replaceMusicUrl] = useState<string | null>(null);
  const [landName, replaceLandName] = useState<string>('');

  return (
    <div className={styles['gameSize'] || missingCssClass()}>
      <LandScreen
        session={props.session}
        land={props.land}
        onMusicChange={replaceMusicUrl}
        changeLandNameDisplay={replaceLandName}
      />
      <div
        className={`mt-2 p-1 bg-${
          props.session ? 'secondary' : 'warning'
        } d-flex align-items-center`}
        style={{ textTransform: 'uppercase' }}
      >
        <span
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontSize: '1rem',
          }}
        >
          {props.session ? (
            <>{landName}</>
          ) : (
            <LinkAnchor
              href={LOGIN_ROUTE.getHref({ next: getCurrentLocalHref() })}
            >
              Login in to save your progress
            </LinkAnchor>
          )}
        </span>
      </div>
      <div
        className="mt-1 bg-secondary d-flex align-items-center py-1"
        style={{ textTransform: 'uppercase', fontSize: '1rem' }}
      >
        <div className="px-2 bg-secondary" style={{ whiteSpace: 'nowrap' }}>
          <FontAwesomeIcon icon={faMusic} />
        </div>

        <MusicTicker musicUrl={musicUrl} />
      </div>
      <Keypad />
    </div>
  );
}

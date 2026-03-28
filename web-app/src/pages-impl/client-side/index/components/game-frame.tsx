import { faMusic } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { LinkAnchor } from 'src/ui/link-anchor';
import { MainApiSessionData } from 'src/main-api/session/main-api-session-types';
import { getCurrentLocalHref } from 'src/navigation/current-local-href';
import { LOGIN_ROUTE } from '../../login/login-routes';
import { Keypad } from './components/keypad';
import { MusicService, MusicTicker } from './components/music-ticker';
import * as styles from './game-frame.module.scss';
import { ScreenSwitcher } from './components/screen-switcher';
import { ResumeLandNavigationDTO } from '@shared/land/in-game/resume/resume-land-navigation.dto';

export function GameFrame(props: {
  resumedLand: ResumeLandNavigationDTO;
  session: null | MainApiSessionData;
}) {
  const [musicService, replaceMusicService] = useState<
    MusicService | undefined
  >();
  const [landName, replaceLandName] = useState<string>('');

  return (
    <div className={styles['gameSize']}>
      {musicService ? (
        <ScreenSwitcher
          session={props.session}
          resumedLand={props.resumedLand}
          musicService={musicService}
          changeLandNameDisplay={replaceLandName}
        />
      ) : null}
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

        <MusicTicker onService={(s) => replaceMusicService(s)} />
      </div>
      <Keypad />
    </div>
  );
}

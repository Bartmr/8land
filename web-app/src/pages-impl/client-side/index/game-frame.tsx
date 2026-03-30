import { faMusic } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { LinkAnchor } from 'src/ui/link-anchor';
import { UserAuthSessionData } from 'src/users/auth/user-auth-types';
import { getCurrentLocalHref } from 'src/navigation/current-local-href';
import { LOGIN_ROUTE } from '../login/login-routes';
import { Keypad } from './keypad';
import { MusicService, MusicTicker } from './music-ticker';
import * as styles from './game-frame.module.scss';
import { ScreenSwitcher } from './screen-switcher';
import { ResumeLandNavigationDTO } from '@shared/src/land/in-game/resume/resume-land-navigation.dto';
import { useGamepad } from './gamepad';

export function GameFrame(props: {
  resumedLand: ResumeLandNavigationDTO;
  session: null | UserAuthSessionData;
}) {
  const gamepad = useGamepad();
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
      <Keypad gamepad={gamepad}/>
    </div>
  );
}

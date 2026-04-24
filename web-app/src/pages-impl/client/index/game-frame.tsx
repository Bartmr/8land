import React from 'react';
import { faMusic } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { LinkAnchor } from '../../../ui/link-anchor';
import { UserAuthSessionData } from '../../../users/authentication/user-auth-types';
import { getCurrentLocalHref } from '../../../navigation/current-local-href';
import { LOGIN_ROUTE } from '../login/login-routes';
import { Keypad } from './keypad';
import { MusicService, MusicTicker } from './music-ticker';
import * as styles from './game-frame.module.scss';
import { ScreenSwitcher } from './screen-switcher';
import { ResumeLandNavigationDTO } from '../../../main-api/routes/lands/lands.dtos';
import { KeypadBroker, useKeypadBroker } from './keypad-broker';

export function GameFrame(props: {
  resumedLand: ResumeLandNavigationDTO;
  session: null | UserAuthSessionData;
}) {
  const keypad = useKeypadBroker();
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
          keypad={keypad}
          musicService={musicService}
          changeLandNameDisplay={replaceLandName}
        />
      ) : null}
      <div
        className={`mt-2 p-1 bg-${
          props.session ? 'lcd' : 'warning'
        } text-contrasting d-flex align-items-center`}
        style={{ textTransform: 'uppercase' }}
      >
        <span
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontSize: '0.8em'
          }}
        >
          {props.session ? (
            <>{landName}</>
          ) : (
            <LinkAnchor
              className='text-contrasting'
              href={LOGIN_ROUTE.getHref({ next: getCurrentLocalHref() })}
            >
              Login to save your progress
            </LinkAnchor>
          )}
        </span>
      </div>
      <div
        className="mt-1 bg-lcd text-contrasting d-flex align-items-center py-1"
        style={{ textTransform: 'uppercase', fontSize: '0.8em' }}
      >
        <div className="px-2" style={{ whiteSpace: 'nowrap' }}>
          <FontAwesomeIcon icon={faMusic} />
        </div>

        <MusicTicker onService={(s) => replaceMusicService(s)} />
      </div>
      <Keypad keypad={keypad}/>
    </div>
  );
}

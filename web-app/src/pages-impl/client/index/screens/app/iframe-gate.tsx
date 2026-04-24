import React from 'react';
import { useLayoutEffect, useState } from 'react';
import { EnvironmentVariables } from '../../../../../environment-variables';
import { MusicService } from '../../music-ticker';
import { IframeWrapper } from './iframe-wrapper';
import { AppContext } from './app-screen.types';
import { AppService } from './app-screen';
import { KeypadBroker } from '../../keypad-broker';

export function IframeGate(props: {
  context: AppContext;
  appService: AppService;
  musicService: MusicService;
  keypad: KeypadBroker
}) {
  const [confirmed, replaceConfirmed] = useState(false);

  useLayoutEffect(() => {
    if (props.context.url.startsWith(EnvironmentVariables.SITE_URL)) {
      replaceConfirmed(true);

      return () => {
        // NO-OP
      };
    } else {
      replaceConfirmed(false);

      const keypad = props.keypad;

      const onPressing_A = () => {
        replaceConfirmed(true);
        keypad.removePressing_A_Callback(onPressing_A);
        keypad.removePressing_B_Callback(onPressing_B);
      };

      keypad.onPressing_A(onPressing_A);

      const onPressing_B = () => {
        props.appService.close();
      };

      keypad.onPressing_B(onPressing_B);

      return () => {
        keypad.removePressing_A_Callback(onPressing_A);
        keypad.removePressing_B_Callback(onPressing_B);
      };
    }
  }, [props.context.url]);

  return (
    <div
      style={{
        width: '100%',
        aspectRatio: '160 / 144',
        borderColor: 'var(--body-contrasting-color)',
        borderWidth: '3px',
        borderStyle: 'solid',
      }}
    >
      {confirmed ? (
        <IframeWrapper
          context={props.context}
          musicService={props.musicService}
          keypad={props.keypad}
        />
      ) : (
        <div
          className="bg-lightest d-flex flex-column align-items-center justify-content-center text-center p-3"
          style={{
            height: '100%',
            width: '100%',
            wordBreak: 'break-all',
            overflow: 'auto',
          }}
        >
          <p>You are opening a screen located in:</p>
          <p className="bg-info">{new URL(props.context.url).origin}</p>
          <p>
            Everything in this screen
            <br />
            is running outside of 8Land
          </p>

          <div className="mt-3 d-flex">
            <button
              onClick={() => replaceConfirmed(true)}
              className="btn btn-success me-3"
            >
              Continue <span className="d-inline d-xl-none">(A)</span>
              <span className="d-none d-xl-inline">(A)</span>
            </button>

            <button
              onClick={() => {
                props.appService.close();
              }}
              className="btn btn-danger"
            >
              Cancel <span className="d-inline d-xl-none">(B)</span>
              <span className="d-none d-xl-inline">(S)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

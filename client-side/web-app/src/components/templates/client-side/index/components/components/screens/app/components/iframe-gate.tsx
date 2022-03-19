import { useLayoutEffect, useState } from 'react';
import { GamepadSingleton } from 'src/components/templates/client-side/index/gamepad-singleton';
import { EnvironmentVariables } from 'src/logic/app-internals/runtime/environment-variables';
import { AppService } from '../app-screen';
import { IframeWrapper } from './iframe-wrapper';

export function IframeGate(props: { url: string; appService: AppService }) {
  const [confirmed, replaceConfirmed] = useState(false);

  useLayoutEffect(() => {
    if (props.url.startsWith(EnvironmentVariables.HOST_URL)) {
      replaceConfirmed(true);

      return () => {
        // NO-OP
      };
    } else {
      replaceConfirmed(false);

      const gamepad = GamepadSingleton.getInstance();

      const onPressing_A = () => {
        replaceConfirmed(true);
        gamepad.removePressing_A_Callback(onPressing_A);
        gamepad.removePressing_B_Callback(onPressing_B);
      };

      gamepad.onPressing_A(onPressing_A);

      const onPressing_B = () => {
        props.appService.close();
      };

      gamepad.onPressing_B(onPressing_B);

      return () => {
        gamepad.removePressing_A_Callback(onPressing_A);
        gamepad.removePressing_B_Callback(onPressing_B);
      };
    }
  }, [props.url]);

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
        <IframeWrapper url={props.url} />
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
          <p className="bg-info">{new URL(props.url).origin}</p>
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

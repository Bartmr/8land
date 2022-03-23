import { throwError } from '@app/shared/internals/utils/throw-error';
import { useEffect, useRef, useState } from 'react';
import { TransportedDataGate } from 'src/components/shared/transported-data-gate/transported-data-gate';
import { GamepadSingleton } from 'src/components/templates/client-side/index/gamepad-singleton';
import { TransportedDataStatus } from 'src/logic/app-internals/transports/transported-data/transported-data-types';
import { AppContext } from '../app-screen.types';

export function IframeWrapper(props: { context: AppContext }) {
  const iframe = useRef<null | HTMLIFrameElement>(null);
  const [loading, replaceLoading] = useState(true);

  useEffect(() => {
    return () => {
      GamepadSingleton.getInstance().clearCurrentIframe();
    };
  }, []);

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
      }}
    >
      <>
        {loading ? (
          <div className="p-3" style={{ position: 'absolute' }}>
            <TransportedDataGate
              dataWrapper={{ status: TransportedDataStatus.Loading }}
            >
              {() => null}
            </TransportedDataGate>
          </div>
        ) : null}
      </>
      <>
        <iframe
          title="app-screen-iframe"
          id="app-screen-iframe"
          width="100%"
          height="100%"
          src={props.context.url}
          ref={(ref) => {
            iframe.current = ref;

            if (ref) {
              GamepadSingleton.getInstance().setCurrentIframe(ref);
            }
          }}
          onLoad={() => {
            replaceLoading(false);

            if (!iframe.current) {
              throw new Error();
            }

            const iframeDoc = iframe.current.contentDocument || throwError();

            const script = iframeDoc.createElement('script');
            script.append(
              `window.explore8Land = ${JSON.stringify(props.context)}`,
            );
            iframeDoc.documentElement.appendChild(script);
          }}
          onError={() => {
            replaceLoading(false);
          }}
        />
      </>
    </div>
  );
}

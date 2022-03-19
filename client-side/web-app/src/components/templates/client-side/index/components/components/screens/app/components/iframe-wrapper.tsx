import { useEffect, useRef, useState } from 'react';
import { TransportedDataGate } from 'src/components/shared/transported-data-gate/transported-data-gate';
import { GamepadSingleton } from 'src/components/templates/client-side/index/gamepad-singleton';
import { TransportedDataStatus } from 'src/logic/app-internals/transports/transported-data/transported-data-types';

export function IframeWrapper(props: { url: string }) {
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
          src={props.url}
          ref={(ref) => {
            iframe.current = ref;

            if (ref) {
              GamepadSingleton.getInstance().setCurrentIframe(ref);
            }
          }}
          onLoad={() => {
            replaceLoading(false);

            // TODO
            // INJECT JS PROPERTIES: user { appId }, land: { id, name }
            // window.explore8land = { user?, land }
          }}
          onError={() => {
            replaceLoading(false);
          }}
        />
      </>
    </div>
  );
}

import { useLayoutEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { TransportedDataGate } from 'src/components/shared/transported-data-gate/transported-data-gate';
import { GamepadSingleton } from 'src/components/templates/client-side/index/gamepad-singleton';
import { TransportedDataStatus } from 'src/logic/app-internals/transports/transported-data/transported-data-types';
import { MusicService } from '../../../music-ticker';
import { AppContext } from '../app-screen.types';

export function IframeWrapper(props: {
  context: AppContext;
  musicService: MusicService;
}) {
  const iframe = useRef<null | HTMLIFrameElement>(null);
  const [loading, replaceLoading] = useState(true);

  const url = new URL(props.context.url);

  url.searchParams.set('is8land', 'true');

  useLayoutEffect(() => {
    const listener = (e: MessageEvent) => {
      if (e.data === '8land:context:get') {
        iframe.current?.contentWindow?.postMessage(
          {
            event: '8land:context',
            data: props.context,
          },
          '*',
        );
      } else if (e.data === '8land:music:stop') {
        props.musicService.pause();
      }
    };

    window.addEventListener('message', listener);

    return () => {
      window.removeEventListener('message', listener);

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
      <Helmet>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1.0, user-scalable=0, shrink-to-fit=no"
        />
      </Helmet>
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
          src={url.toString()}
          ref={(ref) => {
            if (ref) {
              iframe.current = ref;

              GamepadSingleton.getInstance().setCurrentIframe(ref);
            }
          }}
          onLoad={() => {
            replaceLoading(false);
          }}
          onError={() => {
            replaceLoading(false);
          }}
        />
      </>
    </div>
  );
}

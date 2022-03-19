import { throwError } from '@app/shared/internals/utils/throw-error';
import { useEffect, useState } from 'react';
import { v4 } from 'uuid';
import { GamepadSingleton } from '../../../../gamepad-singleton';
import { LandScreenService } from '../land/land-screen.service';
import { IframeGate } from './components/iframe-gate';

export class AppService {
  private render: () => void;

  private onOpen: () => void;
  private onClose: () => void;
  private landScreenServiceRef: React.MutableRefObject<LandScreenService | null>;

  public lockCurrentScreen = false;

  public currentUrl: null | string = null;

  constructor(args: {
    render: AppService['render'];
    onOpen: AppService['onOpen'];
    onClose: AppService['onClose'];
    landScreenServiceRef: AppService['landScreenServiceRef'];
  }) {
    this.render = args.render;

    this.onOpen = args.onOpen;
    this.onClose = args.onClose;

    this.landScreenServiceRef = args.landScreenServiceRef;
  }

  openUrl(url: string) {
    if (url === this.currentUrl) {
      return;
    }

    this.currentUrl = url;
    this.lockCurrentScreen = true;

    (
      this.landScreenServiceRef.current?.currentScene || throwError()
    ).sys.pause();

    this.onOpen();
    this.render();
  }

  close() {
    if (!this.lockCurrentScreen) {
      return;
    }

    this.lockCurrentScreen = false;

    setTimeout(() => {
      this.currentUrl = null;

      this.render();
    }, 500);

    (
      this.landScreenServiceRef.current?.currentScene || throwError()
    ).sys.resume();

    this.onClose();
    this.render();
  }
}

export function AppScreen(props: {
  onService: (musicService: AppService) => void;
  onOpen: () => void;
  onClose: () => void;
  landScreenServiceRef: React.MutableRefObject<LandScreenService | null>;
}) {
  const [, replaceRenderId] = useState<string>(v4());
  const [service, replaceService] = useState<AppService | undefined>();

  useEffect(() => {
    const sv = new AppService({
      render: () => replaceRenderId(v4()),
      onOpen: props.onOpen,
      onClose: props.onClose,
      landScreenServiceRef: props.landScreenServiceRef,
    });

    const gamepad = GamepadSingleton.getInstance();

    const onPressing_Escape = () => {
      sv.close();
    };

    gamepad.onPressing_Escape(onPressing_Escape);

    replaceService(sv);
    props.onService(sv);

    return () => {
      gamepad.removePressing_Escape_Callback(onPressing_Escape);
    };
  }, []);

  return (
    <>
      {service && service.lockCurrentScreen ? (
        <style>
          {`
    @keyframes escape-pulse {
      0% {
        background-color: var(--bs-light);
      }
      50% {
        background-color: var(--bs-warning);
      }
      100% {
        background-color: var(--bs-light);
      }
    }

    #game-button-escape {
      animation: escape-pulse 3s infinite;
    }
    `}
        </style>
      ) : null}
      {service && service.currentUrl ? (
        <IframeGate url={service.currentUrl} appService={service} />
      ) : null}
    </>
  );
}

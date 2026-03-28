import { throwError } from '@app/shared/internals/utils/throw-error';
import { useEffect, useState } from 'react';
import { v4 } from 'uuid';
import { GamepadSingleton } from '../../../../gamepad-singleton';
import { ESCAPE_BUTTON_SELECTOR } from '../../keypad-utils';
import { MusicService } from '../../music-ticker';
import { LandScreenService } from '../land/land-screen.service';
import { AppContext } from './app-screen.types';
import { IframeGate } from './components/iframe-gate';

export class AppService {
  private render: () => void;

  private onOpen: () => void;
  private onClose: () => void;
  private landScreenServiceRef: React.MutableRefObject<LandScreenService | null>;
  private musicService: MusicService;

  public active = false;

  public currentContext: AppContext | null = null;

  constructor(args: {
    render: AppService['render'];
    onOpen: AppService['onOpen'];
    onClose: AppService['onClose'];
    landScreenServiceRef: AppService['landScreenServiceRef'];
    musicService: AppService['musicService'];
  }) {
    this.render = args.render;

    this.onOpen = args.onOpen;
    this.onClose = args.onClose;

    this.landScreenServiceRef = args.landScreenServiceRef;

    this.musicService = args.musicService;
  }

  openApp(context: AppContext) {
    if (context.url === this.currentContext?.url) {
      return;
    }

    this.currentContext = context;

    this.active = true;

    this.musicService.fadeMusic();

    (
      this.landScreenServiceRef.current?.currentScene || throwError()
    ).sys.pause();

    this.onOpen();
    this.render();
  }

  close() {
    if (!this.active) {
      return;
    }

    this.active = false;

    this.musicService.play();
    this.musicService.raiseMusic();

    setTimeout(() => {
      this.currentContext = null;

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
  musicService: MusicService;
}) {
  const [, replaceRenderId] = useState<string>(v4());
  const [service, replaceService] = useState<AppService | undefined>();

  useEffect(() => {
    const sv = new AppService({
      render: () => replaceRenderId(v4()),
      onOpen: props.onOpen,
      onClose: props.onClose,
      landScreenServiceRef: props.landScreenServiceRef,
      musicService: props.musicService,
    });

    const gamepad = GamepadSingleton.getInstance();

    const onPressing_Escape = () => {
      if (sv.active) {
        sv.close();
        return 'stop-propagation' as const;
      }

      return 'continue-propagation' as const;
    };

    gamepad.onPressing_Escape(onPressing_Escape, 'appScreen');

    replaceService(sv);
    props.onService(sv);

    return () => {
      gamepad.removePressing_Escape_Callback('appScreen');
    };
  }, []);

  return (
    <>
      {service && service.active ? (
        <style>
          {`
@keyframes escape-pulse {
  10% {
    background-color: #ffff55;
    transform: scale3d(1.05, 1.05, 1.05);
  }
  100% {
    background-color: var(--bs-light);
    transform: scale3d(1, 1, 1);
  }
}

${ESCAPE_BUTTON_SELECTOR} {
  animation: escape-pulse 1.5s infinite;
}
    `}
        </style>
      ) : null}
      {service && service.currentContext ? (
        <IframeGate
          context={service.currentContext}
          appService={service}
          musicService={props.musicService}
        />
      ) : null}
    </>
  );
}

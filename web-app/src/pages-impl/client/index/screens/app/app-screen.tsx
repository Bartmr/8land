import React from 'react';
import { useEffect, useState } from 'react';
import { v4 } from 'uuid';
import { MusicService } from '../../music-ticker';
import { LandScreenService } from '../land/land-screen.service';
import { AppContext } from './app-screen.types';
import { KeypadBroker } from '../../keypad-broker';
import { BackKeyActive } from '../../keypad';
import { IframeGate } from './iframe-gate';
import { throwError } from '../../../../../throw-error';

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
  keypad: KeypadBroker
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

    const keypad = props.keypad;

    const onPressing_Back = () => {
      if (sv.active) {
        sv.close();
        return 'stop-propagation' as const;
      }

      return 'continue-propagation' as const;
    };

    keypad.onPressing_Back(onPressing_Back, 'appScreen');

    replaceService(sv);
    props.onService(sv);

    return () => {
      keypad.removePressing_Back_Callback('appScreen');
    };
  }, []);

  return (
    <>
      {service && service.active ? (
        <BackKeyActive />
      ) : null}
      {service && service.currentContext ? (
        <IframeGate
          context={service.currentContext}
          appService={service}
          musicService={props.musicService}
          keypad={props.keypad}
        />
      ) : null}
    </>
  );
}

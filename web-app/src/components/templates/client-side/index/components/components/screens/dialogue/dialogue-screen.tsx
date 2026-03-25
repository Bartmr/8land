import { throwError } from '@app/shared/internals/utils/throw-error';
import { useEffect, useState } from 'react';
import { v4 } from 'uuid';
import { GamepadSingleton } from '../../../../gamepad-singleton';
import { LandScreenService } from '../land/land-screen.service';

export class DialogueService {
  private render: () => void;
  private onOpen: () => void;
  private onClose: () => void;
  private landScreenServiceRef: React.MutableRefObject<LandScreenService | null>;

  public lockCurrentScreen = false;

  public currentText: null | string = null;

  constructor(args: {
    render: DialogueService['render'];
    onOpen: DialogueService['onOpen'];
    onClose: DialogueService['onClose'];
    landScreenServiceRef: DialogueService['landScreenServiceRef'];
  }) {
    this.render = args.render;

    this.onOpen = args.onOpen;
    this.onClose = args.onClose;

    this.landScreenServiceRef = args.landScreenServiceRef;
  }

  openText(text: string) {
    if (text === this.currentText) {
      return;
    }

    this.currentText = text;
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
      this.currentText = null;
    }, 500);

    (
      this.landScreenServiceRef.current?.currentScene || throwError()
    ).sys.resume();

    this.onClose();
    this.render();
  }
}

export function DialogueScreen(props: {
  onService: (musicService: DialogueService) => void;
  onOpen: () => void;
  onClose: () => void;
  landScreenServiceRef: React.MutableRefObject<LandScreenService | null>;
}) {
  const [, replaceRenderId] = useState<string>(v4());
  const [service, replaceService] = useState<DialogueService | undefined>();

  useEffect(() => {
    const sv = new DialogueService({
      render: () => replaceRenderId(v4()),
      onOpen: props.onOpen,
      onClose: props.onClose,
      landScreenServiceRef: props.landScreenServiceRef,
    });

    const gamepad = GamepadSingleton.getInstance();

    const onPressing_A = () => {
      sv.close();
    };

    gamepad.onPressing_A(onPressing_A);

    const onPressing_B = () => {
      sv.close();
    };

    gamepad.onPressing_B(onPressing_B);

    replaceService(sv);
    props.onService(sv);

    const onPressing_Escape = () => {
      if (sv.lockCurrentScreen) {
        sv.close();

        return 'stop-propagation' as const;
      }

      return 'continue-propagation' as const;
    };

    gamepad.onPressing_Escape(onPressing_Escape, 'dialogueScreen');

    replaceService(sv);
    props.onService(sv);

    return () => {
      gamepad.removePressing_A_Callback(onPressing_A);
      gamepad.removePressing_B_Callback(onPressing_B);
      gamepad.removePressing_Escape_Callback('dialogueScreen');
    };
  }, []);

  return (
    <>
      {service ? (
        <div
          className="bg-lightest"
          style={{
            width: '100%',
            aspectRatio: '160 / 144',
            padding: 'var(--spacer-1)',
          }}
        >
          <div
            className="d-flex align-items-center p-3"
            style={{
              height: '100%',
              width: '100%',
              borderColor: '#000000',
              borderWidth: '10px',
              borderStyle: 'double',
              fontSize: '1.5rem',
              wordBreak: 'break-all',
            }}
          >
            {service.currentText}
          </div>
        </div>
      ) : null}
    </>
  );
}

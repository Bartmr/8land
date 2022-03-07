import { useEffect, useState } from 'react';
import { v4 } from 'uuid';
import { GamepadSingleton } from '../../../../gamepad-singleton';

export class DialogueService {
  private render: () => void;
  private onOpen: () => void;
  private onClose: () => void;

  public currentText: null | string = null;
  public lockCurrentScreen = false;

  constructor(args: {
    render: DialogueService['render'];
    onOpen: DialogueService['onOpen'];
    onClose: DialogueService['onClose'];
  }) {
    this.render = args.render;

    this.onOpen = args.onOpen;
    this.onClose = args.onClose;
  }

  openText(text: string) {
    if (text === this.currentText) {
      return;
    }

    this.currentText = text;
    this.lockCurrentScreen = true;

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

    this.onClose();
    this.render();
  }
}

export function DialogueScreen(props: {
  onService: (musicService: DialogueService) => void;
  onOpen: () => void;
  onClose: () => void;
}) {
  const [, replaceRenderId] = useState<string>(v4());
  const [service, replaceService] = useState<DialogueService | undefined>();

  useEffect(() => {
    const sv = new DialogueService({
      render: () => replaceRenderId(v4()),
      onOpen: props.onOpen,
      onClose: props.onClose,
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

    return () => {
      gamepad.removePressing_A_Callback(onPressing_A);
      gamepad.removePressing_B_Callback(onPressing_B);
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

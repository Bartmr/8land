import { useEffect, useState } from 'react';
import { v4 } from 'uuid';
import { GamepadSingleton } from '../../../../gamepad-singleton';

export class AppService {
  private render: () => void;

  public currentUrl: null | string = null;

  constructor(args: { render: AppService['render'] }) {
    this.render = args.render;
  }

  openUrl(url: string) {
    if (url === this.currentUrl) {
      return;
    }

    this.render();
  }

  close() {
    this.currentUrl = null;
    this.render();
  }
}

export function DialogueScreen(props: {
  onService: (musicService: AppService) => void;
  onOpen: () => void;
  onClose: () => void;
}) {
  const [, replaceRenderId] = useState<string>(v4());
  const [, replaceService] = useState<AppService | undefined>();

  useEffect(() => {
    const sv = new AppService({
      render: () => replaceRenderId(v4()),
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

  return <></>;
}

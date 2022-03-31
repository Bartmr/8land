(() => {
  const searchParams = new URLSearchParams(location.search);

  if (searchParams.get('is8land') === 'true') {
    const KEY_TO_DIRECTION = {
      ArrowUp: 'up',
      ArrowRight: 'right',
      ArrowDown: 'down',
      ArrowLeft: 'left',
    };

    const gamepadCallbacks = new Set();

    window.explore8Land = {
      getContext: () => {
        return new Promise((resolve) => {
          const listener = (e) => {
            if (
              e.data &&
              typeof e.data === 'object' &&
              e.data.event === '8land:context'
            ) {
              window.removeEventListener('message', listener);

              resolve(e.data.data);
            }
          };

          window.addEventListener('message', listener);

          window.parent.postMessage('8land:context:get', '*');
        });
      },
      listenToGamepad: (listener) => {
        gamepadCallbacks.add(listener);
      },
      removeGamepadListener: (listener) => {
        gamepadCallbacks.delete(listener);
      },
      stopMusic: () => {
        window.parent.postMessage('8land:music:stop', '*');
      },
    };

    window.addEventListener('message', (e) => {
      if (
        [
          '8land:gamepad:up',
          '8land:gamepad:down',
          '8land:gamepad:left',
          '8land:gamepad:right',
          '8land:gamepad:none',

          '8land:gamepad:a:pressed',
          '8land:gamepad:a:released',

          '8land:gamepad:b:pressed',
          '8land:gamepad:b:released',
        ].includes(e.data)
      ) {
        const trimmed = e.data.replace('8land:gamepad:', '');

        gamepadCallbacks.forEach((callback) => {
          callback(trimmed);
        });
      }
    });

    let pressedDirections = [];

    window.addEventListener('keydown', (e) => {
      if (
        e.target instanceof HTMLElement &&
        (e.target.classList.contains('8land-ignore-input') ||
          e.target.nodeName === 'INPUT')
      ) {
        return;
      }

      let event;

      if (Object.keys(KEY_TO_DIRECTION).includes(e.key)) {
        const direction = KEY_TO_DIRECTION[e.key];

        pressedDirections.push(direction);
        event = direction;
      } else if (e.key === 'a') {
        event = 'a:pressed';
      } else if (e.key === 's') {
        event = 's:pressed';
      }

      gamepadCallbacks.forEach((callback) => {
        callback(event);
      });
    });

    window.addEventListener('keyup', (e) => {
      if (
        (e.target instanceof HTMLElement &&
          e.target.classList.contains('8land-ignore-input')) ||
        e.target.nodeName === 'INPUT'
      ) {
        return;
      }

      let event;

      if (Object.keys(KEY_TO_DIRECTION).includes(e.key)) {
        const direction = KEY_TO_DIRECTION[e.key];

        pressedDirections = pressedDirections.filter((d) => d != direction);

        if (pressedDirections.length === 0) {
          event = 'none';
        } else {
          event = pressedDirections[pressedDirections.length - 1];
        }
      } else if (e.key === 'a') {
        event = 'a:released';
      } else if (e.key === 's') {
        event = 's:released';
      }

      gamepadCallbacks.forEach((callback) => {
        callback(event);
      });
    });
  }
})();

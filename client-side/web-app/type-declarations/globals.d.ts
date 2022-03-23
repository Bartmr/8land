import { SoundcloudSong } from 'src/components/templates/client-side/index/soundcloud-types';
import {
  ProviderMessage,
  ProviderRpcError,
  ProviderConnectInfo,
  RequestArguments,
} from 'hardhat/types';
import { AppContext } from 'src/components/templates/client-side/index/components/components/screens/app/app-screen.types';

interface EthereumEvent {
  connect: ProviderConnectInfo;
  disconnect: ProviderRpcError;
  accountsChanged: Array<string>;
  chainChanged: string;
  message: ProviderMessage;
}

type EthereumEventKeys = keyof EthereumEvent;
type EthereumEventHandler<K extends EthereumEventKeys> = (
  event: EthereumEvent[K],
) => void;

declare global {
  interface Window {
    // https://developers.soundcloud.com/docs/api/html5-widget#resources
    // https://developers.soundcloud.com/blog/html5-widget-api
    SC?: {
      Widget: {
        Events: {
          LOAD_PROGRESS: string;
          PLAY_PROGRESS: string;
          PLAY: string;
          PAUSE: string;
          FINISH: string;
          SEEK: string;
          READY: string;
          CLICK_DOWNLOAD: string;
          CLICK_BUY: string;
          OPEN_SHARE_PANEL: string;
          ERROR: string;
        };
      } & ((element: string | HTMLIFrameElement) => {
        bind(eventName: string, listener: (...args: unknown[]) => void): void;
        unbind(eventName: string): void;
        load(
          url: string,
          options?: Partial<{
            auto_play: boolean;
            color: string;
            buying: boolean;
            sharing: boolean;
            download: boolean;
            show_artwork: boolean;
            show_playcount: boolean;
            show_user: boolean;
            start_track: number;
            single_active: boolean;
            callback: () => void;
          }>,
        ): void;
        play: () => void;
        pause: () => void;
        toggle: () => void;
        seekTo(milliseconds: number): void;
        setVolume(volume: number): void;
        next: () => void;
        prev(): void;
        skip(soundIndex: number): void;
        getVolume(callback: (...args: unknown[]) => void): void;
        getDuration(callback: (...args: unknown[]) => void): void;
        getPosition(callback: (...args: unknown[]) => void): void;
        getSounds(callback: (...args: unknown[]) => void): void;
        getCurrentSound(callback: (song: SoundcloudSong) => void): void;
        getCurrentSoundIndex(callback: (...args: unknown[]) => void): void;
        isPaused(callback: (...args: unknown[]) => void): void;
      });
    };

    ethereum?:
      | { isMetaMask?: false }
      | {
          isMetaMask: true;
          autoRefreshOnNetworkChange: boolean;
          chainId: string;
          isStatus?: boolean;
          networkVersion: string;
          on<K extends EthereumEventKeys>(
            event: K,
            eventHandler: EthereumEventHandler<K>,
          ): void;
          request(request: {
            method: 'eth_requestAccounts';
          }): Promise<string[]>;
          request(request: {
            method: 'personal_sign';
            params: [string, string];
          }): Promise<string>;
          sendAsync: (request: RequestArguments) => Promise<unknown>;
        };

    explore8Land?: AppContext;
  }
}

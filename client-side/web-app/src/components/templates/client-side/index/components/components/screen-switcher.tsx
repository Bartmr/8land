import { GetLandDTO } from '@app/shared/land/get/get-land.dto';
import { MainApiSessionData } from 'src/logic/app-internals/apis/main/session/main-api-session-types';
import { LandScreen } from './screens/land/land-screen';

export function ScreenSwitcher(props: {
  onMusicChange: (musicUrl: string | null) => void;
  land: GetLandDTO;
  session: null | MainApiSessionData;
  changeLandNameDisplay: (landName: string) => void;
}) {
  return (
    <>
      <LandScreen {...props} />
    </>
  );
}

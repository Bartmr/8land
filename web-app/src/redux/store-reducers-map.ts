import { MainApiReducer } from '../main-api/main-api-reducer';

export type StoreReducersMap = Partial<{
  mainApi: MainApiReducer;
}>;

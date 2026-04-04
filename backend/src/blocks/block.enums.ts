export enum DynamicBlockType {
  Door = 'door',
  App = 'app',
  // NO-OP type
  Other = 'other',
}

export enum StaticBlockType {
  Collides = 'collides',
  Text = 'text',
  TrainPlatform = 'train-platform',
  Start = 'start',
}

export const STATIC_BLOCK_TYPE_VALUES = [
StaticBlockType.Collides,
StaticBlockType.Text,
StaticBlockType.TrainPlatform,
StaticBlockType.Start
]
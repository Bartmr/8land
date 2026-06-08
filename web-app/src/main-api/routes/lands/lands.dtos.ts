export class CreateLandRequestDTO {
  name!: string;
}

export class EditLandBodyDTO extends CreateLandRequestDTO {
  backgroundMusicUrl?: string | null;
}

class GetLandDoorReferencingDTO {
  id!: string;
  fromLandId!: string;
  fromLandName!: string;
}

class GetLandDoorBlockDestinationDTO {
  id!: string;
  name!: string;
}

class GetLandDoorBlockEntryDTO {
  id!: string;
  toLand!: GetLandDoorBlockDestinationDTO;
}

class GetLandAppBlockEntryDTO {
  id!: string;
  url!: string;
}

export class GetLandAssetsDTO {
  baseUrl!: string;
  mapKey!: string;
  tilesetKey!: string;
}

export class GetLandDTO {
  id!: string;
  name!: string;
  backgroundMusicUrl!: string | null;
  doorBlocks!: GetLandDoorBlockEntryDTO[];
  doorBlocksReferencing!: GetLandDoorReferencingDTO[];
  appBlocks!: GetLandAppBlockEntryDTO[];
  assets: undefined | GetLandAssetsDTO;
  isStartLand!: boolean;
}

export class NavigateToLandDTO extends GetLandDTO {}

class LastDoorDTO {
  id!: string;
  toLandId!: string;
}

class LastTrainTravelDTO {
  comingBackToStation!: boolean;
}

export class ResumeLandNavigationDTO extends GetLandDTO {
  lastDoor!: null | LastDoorDTO;
  lastTrainTravel!: null | LastTrainTravelDTO;
  lastCheckpointWasDeleted!: boolean;
}

class LandFromIndex {
  id!: string;
  name!: string;
  published!: boolean;
  isStartingLand!: boolean;
}

export class IndexLandsDTO {
  total!: number;
  limit!: number;
  lands!: LandFromIndex[];
}

export class GetLandsToClaimDTO {
  free!: number;
}

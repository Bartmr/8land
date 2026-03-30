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

export class IndexLandsQueryDTO {
  skip!: number;
}

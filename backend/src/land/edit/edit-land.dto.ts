import {
  CreateLandRequestDTO,
  CreateLandResponseDTO,
} from '../create/create-land.dto';

export class EditLandParametersDTO {
  landId!: string;
}

export class EditLandBodyDTO extends CreateLandRequestDTO {
  backgroundMusicUrl?: string | null;
}

export class EditLandDTO extends CreateLandResponseDTO {}

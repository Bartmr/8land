import { Get, Param } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import {
  GetLandDTO,
  GetLandParametersDTO,
} from 'libs/shared/src/land/get/get-land.dto';
import { ResourceNotFoundException } from 'src/internals/server/resource-not-found.exception';
import { StorageService } from 'src/internals/storage/storage.service';
import { Connection } from 'typeorm';
import { LandsService } from '../lands.service';

export class LandsController {
  constructor(
    @InjectConnection() private connection: Connection,
    private storageService: StorageService,
    private landService: LandsService,
  ) {}

  @Get('/getEditable/:id')
  async getLand(
    @Param() parameters: GetLandParametersDTO,
  ): Promise<GetLandDTO> {
    const land = await this.landService.getLand(parameters.id);

    if (!land) {
      throw new ResourceNotFoundException();
    } else {
      return land;
    }
  }
}

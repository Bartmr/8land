import { Controller, Get } from '@nestjs/common';
import { BoardTrainDTO } from 'libs/shared/src/train/board-train.dto';
import { Connection } from 'typeorm';

@Controller('/train')
export class TrainController {
  constructor(private connection: Connection) {}

  @Get('/world/:worldId')
  async board(): Promise<BoardTrainDTO> {
    throw new Error();
  }
}

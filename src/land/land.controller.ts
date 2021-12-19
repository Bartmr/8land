import { Controller, Post } from '@nestjs/common';

@Controller('land')
export class Land {
  @Post()
  createLand() {
    // Change fileJSON?.tilesets[0]?.image to backend-stored tileset filename
    // Check file sizes and formats of all files again
  }
}

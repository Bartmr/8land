import {
  // BadRequestException,
  Controller,
  // Post,
  // UploadedFiles,
  // UseInterceptors,
} from '@nestjs/common';
// import { FileFieldsInterceptor } from '@nestjs/platform-express';
// import { ApiBody, ApiConsumes } from '@nestjs/swagger';
// import { CreateTerritoryRequest } from 'libs/shared/src/territories/territories.dto';
// import { CreateTerritoryRequestJSONSchema } from 'libs/shared/src/territories/territories.schemas';
// import { Role } from 'src/auth/roles/roles';
// import { RolesUpAndIncluding } from 'src/auth/roles/roles.decorator';
// import fileType from 'file-type';

@Controller('territories')
export class TerritoriesController {
  // @Post()
  // @RolesUpAndIncluding(Role.Admin)
  // @UseInterceptors(
  //   FileFieldsInterceptor([
  //     { name: 'data', maxCount: 1 },
  //     { name: 'thumbnail', maxCount: 1 },
  //   ]),
  // )
  // @ApiConsumes('multipart/form-data')
  // @ApiBody({
  //   type: CreateTerritoryRequest,
  // })
  // async createTerritory(
  //   @UploadedFiles()
  //   files: {
  //     data?: Express.Multer.File[];
  //     thumbnail?: Express.Multer.File[];
  //   },
  // ) {
  //   const dataFile =
  //     files.data?.[0] ||
  //     (() => {
  //       throw new BadRequestException({ error: 'no-data-file' });
  //     })();
  //   const thumbnailFile =
  //     files.thumbnail?.[0] ||
  //     (() => {
  //       throw new BadRequestException({ error: 'no-thumbnail-file' });
  //     })();
  //   if (dataFile.size > 64000) {
  //     throw new BadRequestException({ error: 'data-exceeds-file-size-limit' });
  //   }
  //   if (thumbnailFile.size > 1024000) {
  //     throw new BadRequestException({
  //       error: 'thumbnail-exceeds-file-size-limit',
  //     });
  //   }
  //   /* --- */
  //   const tilesetFormat =
  //     (await fileType.fromBuffer(thumbnailFile.buffer)) ||
  //     (() => {
  //       throw new BadRequestException({ error: 'unrecognized-thumbnail-format' });
  //     })();
  //   if (tilesetFormat.ext !== 'png' || tilesetFormat.mime !== 'image/png') {
  //     throw new BadRequestException('thumbnail-not-a-png-file');
  //   }
  //   /* --- */
  //   let dataJSON: unknown;
  //   try {
  //     const string = dataFile.buffer.toString();
  //     dataJSON = JSON.parse(string) as unknown;
  //   } catch (err) {
  //     throw new BadRequestException({ error: 'unparsable-data-json' });
  //   }
  //   const dataValidationResult = CreateTerritoryRequestJSONSchema.validate(dataJSON)
  //   if (dataValidationResult.errors) {
  //     throw new BadRequestException({
  //       error: 'tiled-json-validation-error',
  //       messageTree: dataValidationResult.messagesTree,
  //     });
  //   }
  //   const data = dataValidationResult.value.data
  //   /* --- */
  // }
}

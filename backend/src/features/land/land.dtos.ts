import { z } from 'zod';
import { StaticBlockType } from 'src/features/blocks/blocks.dtos';

export class CreateLandRequestDTO {
  name!: string;
}

export class CreateLandResponseDTO {
  id!: string;
  name!: string;
}

export class DeleteLandParametersDTO {
  landId!: string;
}

export class EditLandParametersDTO {
  landId!: string;
}

export class EditLandBodyDTO extends CreateLandRequestDTO {
  backgroundMusicUrl?: string | null;
}

export class EditLandDTO extends CreateLandResponseDTO {}

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

export class GetLandAppBlockEntryDTO {
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

export class GetLandParametersDTO {
  id!: string;
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

export class IndexLandsQueryDTO {
  skip!: number;
}

export class GetLandsToClaimDTO {
  free!: number;
}

export class NavigateToLandQueryDTO {
  doorBlockId!: string;
  currentLandId!: string;
}

export class NavigateToLandDTO extends GetLandDTO {}

class LastDoorDTO {
  id!: string;
  toLandId!: string;
}

class LastTrainTravelDTO {
  comingBackToStation!: boolean;
}

export class ResumeLandNavigationDTO extends NavigateToLandDTO {
  lastDoor!: null | LastDoorDTO;
  lastTrainTravel!: null | LastTrainTravelDTO;
  lastCheckpointWasDeleted!: boolean;
}

export class UploadLandAssetsParameters {
  landId!: string;
}

export const CreateLandRequestSchemaObj = {
  name: z
    .string()
    .transform((s) => s.trim())
    .refine((n) => n.length >= 1, 'Land name must have at least 1 character')
    .refine((n) => n.length <= 64, 'Land name cannot be more than 64 characters'),
};

export const CreateLandRequestSchema = z.object(CreateLandRequestSchemaObj);

export const DeleteLandParametersSchema: z.ZodType<DeleteLandParametersDTO> =
  z.object({
    landId: z.uuid(),
  });

export const SoundcloudSongApiUrlSchema = z.string().optional().refine((s) => {
  if (!s) {
    return true;
  }

  return s.startsWith('https://api.soundcloud.com/tracks');
}, 'Invalid Soundcloud API song url');

export const EditLandParametersSchema: z.ZodType<EditLandParametersDTO> = z.object({
  landId: z.uuid(),
});

export const EditLandBodySchema = z.object({
  ...CreateLandRequestSchemaObj,
  backgroundMusicUrl: SoundcloudSongApiUrlSchema,
});

export const GetLandParametersSchema = z.object({
  id: z.uuid(),
});

export const IndexLandsQuerySchema: z.ZodType<IndexLandsQueryDTO> = z.object({
  skip: z.number().int('Must be an integer'),
});

export const NavigateToLandQuerySchema = z.object({
  doorBlockId: z.uuid(),
  currentLandId: z.uuid(),
});

export const UploadLandAssetsParametersSchema = z.object({
  landId: z.uuid(),
});

export const LAND_TILESET_SIZE_LIMIT = 128000;
export const LAND_MAP_SIZE_LIMIT = 128000;

export const createTiledJSONSchema = ({
  maxWidth: _maxWidth,
  maxHeight: _maxHeight,
  maxWidthMessage,
  maxHeightMessage,
}: {
  maxWidth: number | null;
  maxHeight: number | null;
  maxWidthMessage?: string;
  maxHeightMessage?: string;
}) => {
  const maxWidth = _maxWidth ? _maxWidth + 1 : 41;
  const maxHeight = _maxHeight ? _maxHeight + 1 : 41;

  return z
    .looseObject({
      compressionlevel: z.literal(
        -1,
        'Must set to -1, which is the default value in Tiled',
      ),
      height: z
        .number()
        .int('Must be an integer')
        .refine(
          (h) => h > 0 && h < maxHeight,
          maxHeightMessage || `Must be greater than 0 and less than ${maxHeight}`,
        ),
      infinite: z
        .boolean()
        .refine((i) => !i, 'Map cannot be infinite'),
      layers: z
        .array(
          z.looseObject({
            data: z.array(z.number().int('Must be an integer').min(0, 'Must be a positive number')),
            height: z.number().int('Must be an integer').min(0, 'Must be a positive number'),
            id: z.number().int('Must be an integer').min(0, 'Must be a positive number'),
            name: z
              .string()
              .refine((s) => s.trim().length > 0, 'Layer must have a name'),
            opacity: z.literal(1, 'All layers must have full opacity'),
            type: z.literal('tilelayer', 'Only tile layers are allowed'),
            visible: z.literal(true, 'All layers must be visible').optional(),
            width: z.number().int('Must be an integer').min(0, 'Must be a positive number'),
            x: z.literal(0, 'Must be set to 0'),
            y: z.literal(0, 'Must be set to 0'),
          }),
        )
        .min(1, 'You must have at least one layer'),
      nextlayerid: z.number().int('Must be an integer').min(0, 'Must be a positive number'),
      nextobjectid: z.number().int('Must be an integer').min(0, 'Must be a positive number'),
      orientation: z.literal('orthogonal', "must be set to 'orthogonal'"),
      renderorder: z.literal('right-down', "must be set to 'right-down'"),
      tiledversion: z.string(),
      tileheight: z.literal(16, 'Must be set to 16'),
      tilesets: z
        .array(
          z.looseObject({
            columns: z.number().int('Must be an integer').min(0, 'Must be a positive number'),
            firstgid: z.number().int('Must be an integer').min(0, 'Must be a positive number'),
            image: z
              .string()
              .transform((s) => s.trim())
              .refine((s) => s.length > 0, 'Tileset must have an image'),
            imageheight: z.number().int('Must be an integer').min(0, 'Must be a positive number'),
            imagewidth: z.number().int('Must be an integer').min(0, 'Must be a positive number'),
            margin: z.literal(0, 'Must be set to 0'),
            name: z
              .string()
              .refine((s) => s.trim().length > 0, 'Tileset must have a name'),
            spacing: z.literal(0, 'Must be set to 0'),
            tilecount: z.number().int('Must be an integer').min(0, 'Must be a positive number'),
            tileheight: z.literal(16, 'Must be set to 16'),
            tilewidth: z.literal(16, 'Must be set to 16'),
            tiles: z.array(
              z.looseObject({
                id: z.number().int('Must be an integer').min(0, 'Must be a positive number'),
                properties: z
                  .array(
                    z.union([
                      z.object({
                        name: z.literal(
                          StaticBlockType.Collides,
                          'can be set as "collides"',
                        ),
                        type: z.literal(
                          'bool',
                          "'collides' props must be of boolean type",
                        ),
                        value: z.boolean(),
                      }),
                      z.object({
                        name: z.literal(
                          StaticBlockType.Text,
                          'can be set as "text"',
                        ),
                        type: z.literal(
                          'string',
                          "'text' props must be of string type",
                        ),
                        value: z
                          .string()
                          .nullish()
                          .transform((s) => s ?? '')
                          .refine(
                            (s) => s.length <= 255,
                            'Text cannot be longer than 255 characters',
                          ),
                      }),
                      z.object({
                        name: z.literal(
                          StaticBlockType.Start,
                          'can be set as "start"',
                        ),
                        type: z.literal(
                          'bool',
                          "'start' props must be of boolean type",
                        ),
                        value: z.literal(true, 'value must be true'),
                      }),
                      z.object({
                        name: z.literal(
                          StaticBlockType.TrainPlatform,
                          'can be set as "train-platform"',
                        ),
                        type: z.literal(
                          'bool',
                          "'train-platform' props must be of boolean type",
                        ),
                        value: z.literal(true, 'value must be true'),
                      }),
                      z.object({
                        name: z.string(),
                        type: z.literal('string', 'Block IDs must be of string type'),
                        value: z.string(),
                      }),
                    ]),
                  )
                  .optional(),
                animation: z
                  .array(
                    z.looseObject({
                      duration: z.number().int('Must be an integer').min(0, 'Must be a positive number'),
                      tileid: z.number().int('Must be an integer').min(0, 'Must be a positive number'),
                    }),
                  )
                  .optional(),
              }),
            ),
          }),
        )
        .min(1, 'You must have at least one tileset')
        .max(1, 'You cannot have more than one tileset'),
      tilewidth: z.literal(16, 'Must be set to 16'),
      type: z.literal('map', "Must be set to 'map'"),
      version: z
        .string()
        .refine((s) => s.trim().length > 0, 'A version must be specified'),
      width: z
        .number()
        .int('Must be an integer')
        .refine(
          (w) => w > 0 && w < maxWidth,
          maxWidthMessage || `Must be greater than 0 and less than ${maxWidth}`,
        ),
    })
    .superRefine((o, ctx) => {
      for (const layer of o.layers) {
        if (layer.height !== o.height) {
          ctx.addIssue({ code: 'custom', message: `Layer "${layer.name}" height must be equal to the map height` });
        }

        if (layer.width !== o.width) {
          ctx.addIssue({ code: 'custom', message: `Layer "${layer.name}" width must be equal to the map width` });
        }
      }

      for (const tileset of o.tilesets) {
        for (const tile of tileset.tiles) {
          if (tile.animation) {
            for (const animation of tile.animation) {
              if (animation.tileid > tileset.tilecount) {
                ctx.addIssue({ code: 'custom', message: `${animation.tileid} is bigger than the total tiles in the tileset` });
              }
            }
          }
        }
      }
    });
};

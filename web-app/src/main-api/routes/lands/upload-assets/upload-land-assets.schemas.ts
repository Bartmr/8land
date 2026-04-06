import { z } from 'zod';

export const LAND_TILESET_SIZE_LIMIT = 128000;
export const LAND_MAP_SIZE_LIMIT = 128000;

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
  StaticBlockType.Start,
];

const positiveInt = z.number().int('Must be an integer').min(0, 'Must be a positive number');

export const UploadLandAssetsParametersSchema = z.object({
  landId: z.uuid(),
});

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
    .object({
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
          z.object({
            data: z.array(positiveInt),
            height: positiveInt,
            id: positiveInt,
            name: z
              .string()
              .refine((s) => s.trim().length > 0, 'Layer must have a name'),
            opacity: z.literal(1, 'All layers must have full opacity'),
            type: z.literal('tilelayer', 'Only tile layers are allowed'),
            visible: z.literal(true, 'All layers must be visible').optional(),
            width: positiveInt,
            x: z.literal(0, 'Must be set to 0'),
            y: z.literal(0, 'Must be set to 0'),
          }),
        )
        .min(1, 'You must have at least one layer'),
      nextlayerid: positiveInt,
      nextobjectid: positiveInt,
      orientation: z.literal('orthogonal', "must be set to 'orthogonal'"),
      renderorder: z.literal('right-down', "must be set to 'right-down'"),
      tiledversion: z.string(),
      tileheight: z.literal(16, 'Must be set to 16'),
      tilesets: z
        .array(
          z.object({
            columns: positiveInt,
            firstgid: positiveInt,
            image: z
              .string()
              .transform((s) => s.trim())
              .refine((s) => s.length > 0, 'Tileset must have an image'),
            imageheight: positiveInt,
            imagewidth: positiveInt,
            margin: z.literal(0, 'Must be set to 0'),
            name: z
              .string()
              .refine((s) => s.trim().length > 0, 'Tileset must have a name'),
            spacing: z.literal(0, 'Must be set to 0'),
            tilecount: positiveInt,
            tileheight: z.literal(16, 'Must be set to 16'),
            tilewidth: z.literal(16, 'Must be set to 16'),
            tiles: z.array(
              z.object({
                id: positiveInt,
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
                    z.object({
                      duration: positiveInt,
                      tileid: positiveInt,
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

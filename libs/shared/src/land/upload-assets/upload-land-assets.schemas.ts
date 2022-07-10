import { array } from 'not-me/lib/schemas/array/array-schema';
import { boolean } from 'not-me/lib/schemas/boolean/boolean-schema';
import { equals } from 'not-me/lib/schemas/equals/equals-schema';
import { number } from 'not-me/lib/schemas/number/number-schema';
import { object } from 'not-me/lib/schemas/object/object-schema';
import { string } from 'not-me/lib/schemas/string/string-schema';
import { or } from 'not-me/lib/schemas/or/or-schema';
import { uuid } from '../../internals/validation/schemas/uuid.schema';
import { StaticBlockType } from '../../blocks/create/create-block.enums';
import { positiveInteger } from '../../internals/validation/schemas/positive-integer';

export const UploadLandAssetsParametersSchema = object({
  landId: uuid().required(),
}).required();

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

  return object({
    compressionlevel: equals(
      [-1],
      'Must set to -1, which is the default value in Tiled',
    ).required(),
    height: number()
      .required()
      .test((n) => (Number.isInteger(n) ? null : 'Must be an integer'))
      .test((h) =>
        h > 0 && h < maxHeight
          ? null
          : maxHeightMessage ||
            `Must be greater than 0 and less than ${maxHeight}`,
      ),
    infinite: boolean()
      .required()
      .test((i) => (i ? 'Map cannot be infinite' : null)),
    layers: array(
      object({
        data: array(positiveInteger().required()).required(),
        height: positiveInteger().required(),
        id: positiveInteger().required(),
        name: string()
          .required()
          .test((s) => (s.trim().length > 0 ? null : 'Layer must have a name')),
        opacity: equals([1], 'All layers must have full opacity').required(),
        type: equals(['tilelayer'], 'Only tile layers are allowed').required(),
        visible: equals([true], 'All layers must be visible'),
        width: positiveInteger().required(),
        x: equals([0], 'Must be set to 0').required(),
        y: equals([0], 'Must be set to 0').required(),
      }).required(),
    )
      .min(1, 'You must have at least one layer')
      .required(),
    nextlayerid: positiveInteger().required(),
    nextobjectid: positiveInteger().required(),
    orientation: equals(
      ['orthogonal'],
      "must be set to 'orthogonal'",
    ).required(),
    renderorder: equals(
      ['right-down'],
      "must be set to 'right-down'",
    ).required(),
    tiledversion: string().required(),
    tileheight: equals([16], 'Must be set to 16').required(),
    tilesets: array(
      object({
        columns: positiveInteger().required(),
        firstgid: positiveInteger().required(),
        image: string()
          .required()
          .transform((s) => s.trim())
          .test((s) => (s.length > 0 ? null : 'Tileset must have an image')),
        imageheight: positiveInteger().required(),
        imagewidth: positiveInteger().required(),
        margin: positiveInteger().required(),
        name: string()
          .required()
          .test((s) =>
            s.trim().length > 0 ? null : 'Tileset must have a name',
          ),
        spacing: positiveInteger().required(),
        tilecount: positiveInteger().required(),
        tileheight: equals([16], 'Must be set to 16').required(),
        tilewidth: equals([16], 'Must be set to 16').required(),
        tiles: array(
          object({
            id: positiveInteger().required(),
            properties: array(
              or([
                object({
                  name: equals(
                    [StaticBlockType.Collides],
                    'can be set as "collides"',
                  ).required(),
                  type: equals(
                    ['bool'],
                    "'collides' props must be of boolean type",
                  ).required(),
                  value: boolean().required(),
                }),
                object({
                  name: equals(
                    [StaticBlockType.Text],
                    ' can be set as "text"',
                  ).required(),
                  type: equals(
                    ['string'],
                    "'text' props must be of string type",
                  ).required(),
                  value: string()
                    .transform((s) => (!s ? '' : s))
                    .test((s) =>
                      s.length > 255
                        ? 'Text cannot be longer than 255 characters'
                        : null,
                    ),
                }),
                object({
                  name: equals(
                    [StaticBlockType.Start],
                    ' can be set as "start"',
                  ).required(),
                  type: equals(
                    ['bool'],
                    "'start' props must be of boolean type",
                  ).required(),
                  value: equals([true]).required('value must be true'),
                }),
                object({
                  name: equals(
                    [StaticBlockType.TrainPlatform],
                    ' can be set as "train-platform"',
                  ).required(),
                  type: equals(
                    ['bool'],
                    "'train-platform' props must be of boolean type",
                  ).required(),
                  value: equals([true]).required('value must be true'),
                }),
                object({
                  name: string().required(),
                  type: equals(
                    ['string'],
                    'Block IDs must be of string type',
                  ).required(),
                  value: string().required(),
                }),
              ]).required(),
            ).notNull(),
            animation: array(
              object({
                duration: positiveInteger().required(),
                tileid: positiveInteger().required(),
              }).required(),
            ).notNull(),
          }).required(),
        ).required(),
      }).required(),
    )
      .min(1, 'You must have at least one tileset')
      .max(1, 'You cannot have more than one tileset')
      .required(),
    tilewidth: equals([16], 'Must be set to 16').required(),
    type: equals(['map'], "Must be set to 'map'").required(),
    version: string()
      .required()
      .test((s) =>
        s.trim().length > 0 ? null : 'A version must be specified',
      ),
    width: number()
      .test((n) => (Number.isInteger(n) ? null : 'Must be an integer'))
      .required()
      .test((w) =>
        w > 0 && w < maxWidth
          ? null
          : maxWidthMessage ||
            `Must be greater than 0 and less than ${maxWidth}`,
      ),
  })
    .required()
    .test((o) => {
      for (const layer of o.layers) {
        if (layer.height !== o.height) {
          return `Layer "${layer.name}" height must be equal to the map height`;
        }

        if (layer.width !== o.width) {
          return `Layer "${layer.name}" width must be equal to the map width`;
        }
      }

      for (const tileset of o.tilesets) {
        for (const tile of tileset.tiles) {
          if (tile.animation) {
            for (const animation of tile.animation) {
              if (animation.tileid > tileset.tilecount) {
                return `${animation.tileid} is bigger than the total tiles in the tileset`;
              }
            }
          }
        }
      }

      return null;
    });
};

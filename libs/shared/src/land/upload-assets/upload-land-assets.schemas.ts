import { array } from 'not-me/lib/schemas/array/array-schema';
import { boolean } from 'not-me/lib/schemas/boolean/boolean-schema';
import { equals } from 'not-me/lib/schemas/equals/equals-schema';
import { number } from 'not-me/lib/schemas/number/number-schema';
import { object } from 'not-me/lib/schemas/object/object-schema';
import { or } from 'not-me/lib/schemas/or/or-schema';
import { string } from 'not-me/lib/schemas/string/string-schema';
import { uuid } from '../../internals/validation/schemas/uuid.schema';

export const UploadLandAssetsParametersSchema = object({
  landId: uuid().required(),
}).required();

export const createTiledJSONSchema = () =>
  object({
    height: number()
      .integer()
      .required()
      .test((h) =>
        h > 0 && h < 41
          ? null
          : 'height must be greater than 0 and less than 41',
      ),
    infinite: boolean()
      .required()
      .test((i) => (i ? 'infinite must be false' : null)),
    layers: array(
      object({
        data: array(number().required()).required(),
        height: number().integer().required(),
        id: number().integer().required(),
        name: string().filled(),
        opacity: number().required(),
        type: equals(['tilelayer']).required(),
        visible: equals([true], 'Must be set to true'),
        width: number().integer().required(),
        x: equals([0], 'Must be set to 0').required(),
        y: equals([0], 'Must be set to 0').required(),
      }).required(),
    )
      .min(0, 'You must have at least one tileset')
      .max(1, 'You cannot have more than one layer')
      .required(),
    nextlayerid: number().integer().required(),
    nextobjectid: number().integer().required(),
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
        columns: number().integer(),
        firstgid: number().integer().required(),
        image: string().filled(),
        imageheight: number().integer().required(),
        imagewidth: number().integer().required(),
        margin: number().integer().required(),
        name: string().filled(),
        spacing: number().integer().required(),
        tilecount: number().integer().required(),
        tileheight: equals([16], 'Must be set to 16').required(),
        tiles: array(
          object({
            id: number().integer().required(),
            properties: array(
              or([
                object({
                  animation: equals([]).notNull(),
                  name: string().filled(),
                  type: equals(
                    ['bool'],
                    'Only boolean tile properties are allowed',
                  ).required(),
                  value: boolean().required(),
                }).required(),
                object({
                  animation: array(
                    object({
                      duration: number().integer().required(),
                      tileid: number().integer().required(),
                    }).required(),
                  ).required(),
                }).required(),
              ]).required(),
            ).required(),
          }).required(),
        ).required(),
      }).required(),
    )
      .min(0, 'You must have at least one tileset')
      .max(1, 'You cannot have more than one tileset')
      .required(),
    tilewidth: equals([16], 'Must be set to 16').required(),
    type: equals(['map'], "Must be set to 'map'").required(),
    version: string().filled(),
    width: number()
      .integer()
      .required()
      .test((w) =>
        w > 0 && w < 41
          ? null
          : 'width must be greater than 0 and less than 41',
      ),
  })
    .required()
    .test((o) => {
      for (const layer of o.layers) {
        if (layer.height > o.height) {
          return 'Layer height should not exceed map height';
        }

        if (layer.width > o.width) {
          return 'Layer width should not exceed map width';
        }
      }

      for (const tileset of o.tilesets) {
        for (const tile of tileset.tiles) {
          for (const property of tile.properties) {
            if (property.animation) {
              for (const animation of property.animation) {
                if (animation.tileid > tileset.tilecount) {
                  return `${animation.tileid} is bigger than the total tiles in the tileset`;
                }
              }
            }
          }
        }
      }

      return null;
    });
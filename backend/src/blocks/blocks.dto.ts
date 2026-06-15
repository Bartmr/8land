import { z } from 'zod';

export class CreateDoorBlockDTO {
  type!: DynamicBlockType.Door;
  destinationLandName!: string;
}

export class AppBlockDTO {
  type!: DynamicBlockType.App;
  url!: string;
}

export class OtherBlockDTO {
  type!: DynamicBlockType.Other;
}

export class CreateBlockRequestDTO {
  landId!: string;
  data!: CreateDoorBlockDTO | AppBlockDTO | OtherBlockDTO;
}

export class DeleteBlockURLParameters {
  blockType!: DynamicBlockType.Door | DynamicBlockType.App;
  blockId!: string;
}

export enum DynamicBlockType {
  Door = 'door',
  App = 'app',
  // NO-OP type
  Other = 'other',
}

export enum StaticBlockType {
  Collides = 'collides',
  Text = 'text',
  TrainPlatform = 'train-platform',
  Start = 'start',
}

export const CreateBlockRequestSchema = z.object({
  landId: z.uuid(),
  data: z
    .discriminatedUnion('type', [
      z.object({
        type: z.literal(DynamicBlockType.Door),
        destinationLandName: z
          .string()
          .transform((s) => s.trim())
          .refine((s) => s.length > 0, 'Must be filled'),
      }),
      z.object({
        type: z.literal(DynamicBlockType.App),
        url: z.url(),
      }),
      z.object({
        type: z.literal(DynamicBlockType.Other),
      }),
    ])
    .refine((o) => o.type !== DynamicBlockType.Other, 'Unsupported block type'),
});

export const DeleteBlockURLParamsSchema = z.object({
  blockType: z.union([
    z.literal(DynamicBlockType.Door),
    z.literal(DynamicBlockType.App),
  ]),
  blockId: z.uuid(),
});



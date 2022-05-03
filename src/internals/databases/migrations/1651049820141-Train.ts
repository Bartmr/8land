import { MigrationInterface, QueryRunner } from 'typeorm';

export class Train1651049820141 implements MigrationInterface {
  name = 'Train1651049820141';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "train_platform_block" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "inLandId" uuid,
            CONSTRAINT "PK_f2b08d1ef77868c12f80461629b" PRIMARY KEY ("id")
        )
    `);
    await queryRunner.query(`
        CREATE TABLE "world" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
            "userId" uuid,
            CONSTRAINT "PK_9a0e469d5311d0d95ce1202c990" PRIMARY KEY ("id")
        )
    `);
    await queryRunner.query(`
        CREATE TABLE "train_state" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
            "userId" uuid,
            "boardedOnId" uuid,
            "destinationLandId" uuid,
            CONSTRAINT "PK_27b832cb7188013cabd4aa9de76" PRIMARY KEY ("id")
        )
    `);
    await queryRunner.query(`
        ALTER TABLE "land"
        ADD "isStartingLand" boolean
    `);
    await queryRunner.query(`
        ALTER TABLE "land"
        ADD "worldId" uuid
    `);
    await queryRunner.query(`
        ALTER TABLE "train_platform_block"
        ADD CONSTRAINT "FK_17a010256c9d84ce99a3c2a05f9" FOREIGN KEY ("inLandId") REFERENCES "land"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
        ALTER TABLE "world"
        ADD CONSTRAINT "FK_5c6f20a4c309c357a2934164b5e" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
        ALTER TABLE "land"
        ADD CONSTRAINT "FK_17c933a8881643469968048493a" FOREIGN KEY ("worldId") REFERENCES "world"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
        ALTER TABLE "train_state"
        ADD CONSTRAINT "FK_5eebbbae9fc14bb9e37ca760a72" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
        ALTER TABLE "train_state"
        ADD CONSTRAINT "FK_3c1128584a02c3cd50ced94c40d" FOREIGN KEY ("boardedOnId") REFERENCES "train_platform_block"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
        ALTER TABLE "train_state"
        ADD CONSTRAINT "FK_b6d065bccaade9f8af80bc7fb56" FOREIGN KEY ("destinationLandId") REFERENCES "land"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "train_state" DROP CONSTRAINT "FK_b6d065bccaade9f8af80bc7fb56"
    `);
    await queryRunner.query(`
        ALTER TABLE "train_state" DROP CONSTRAINT "FK_3c1128584a02c3cd50ced94c40d"
    `);
    await queryRunner.query(`
        ALTER TABLE "train_state" DROP CONSTRAINT "FK_5eebbbae9fc14bb9e37ca760a72"
    `);
    await queryRunner.query(`
        ALTER TABLE "land" DROP CONSTRAINT "FK_17c933a8881643469968048493a"
    `);
    await queryRunner.query(`
        ALTER TABLE "world" DROP CONSTRAINT "FK_5c6f20a4c309c357a2934164b5e"
    `);
    await queryRunner.query(`
        ALTER TABLE "train_platform_block" DROP CONSTRAINT "FK_17a010256c9d84ce99a3c2a05f9"
    `);
    await queryRunner.query(`
        ALTER TABLE "land" DROP COLUMN "worldId"
    `);
    await queryRunner.query(`
        ALTER TABLE "land" DROP COLUMN "isStartingLand"
    `);
    await queryRunner.query(`
        DROP TABLE "train_state"
    `);
    await queryRunner.query(`
        DROP TABLE "world"
    `);
    await queryRunner.query(`
        DROP TABLE "train_platform_block"
    `);
  }
}

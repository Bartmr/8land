import { MigrationInterface, QueryRunner } from 'typeorm';

export class Land1640016172054 implements MigrationInterface {
  name = 'Land1640016172054';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "land_assets" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "tiledJsonStorageKey" text NOT NULL,
                "tiledJsonURL" text NOT NULL,
                "tilesetImageStorageKey" text NOT NULL,
                "tilesetImageURL" text NOT NULL,
                CONSTRAINT "PK_72abc5d1ea7187e2e5061e5cabe" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "land" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "name" text NOT NULL,
                "searchableName" text NOT NULL,
                "assetsId" uuid,
                "backgroundMusicUrl" text,
                "soundcloudBackgroundMusicApiUrl" text,
                CONSTRAINT "UQ_searchable_name" UNIQUE ("searchableName"),
                CONSTRAINT "REL_8881982e557d3f2119abf6b0bd" UNIQUE ("assetsId"),
                CONSTRAINT "PK_a6b43171b11dc6bab4a449e7b79" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "door_block" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "toLandId" uuid NOT NULL,
                CONSTRAINT "PK_807d55b046288e491692f3262e2" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "block_entry" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "landId" uuid NOT NULL,
                "doorId" uuid,
                CONSTRAINT "REL_47a3086a222bb23da2406b20ae" UNIQUE ("doorId"),
                CONSTRAINT "PK_65e0c6aacd370399e6952aa8bc7" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "user"
            ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "user"
            ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "land"
            ADD CONSTRAINT "FK_8881982e557d3f2119abf6b0bde" FOREIGN KEY ("assetsId") REFERENCES "land_assets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "door_block"
            ADD CONSTRAINT "FK_d148b102b6b874ab4e34ce2a4ce" FOREIGN KEY ("toLandId") REFERENCES "land"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "block_entry"
            ADD CONSTRAINT "FK_7fdec5b3004c7ada8a1347209a5" FOREIGN KEY ("landId") REFERENCES "land"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "block_entry"
            ADD CONSTRAINT "FK_47a3086a222bb23da2406b20aed" FOREIGN KEY ("doorId") REFERENCES "door_block"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "block_entry" DROP CONSTRAINT "FK_47a3086a222bb23da2406b20aed"
        `);
    await queryRunner.query(`
            ALTER TABLE "block_entry" DROP CONSTRAINT "FK_7fdec5b3004c7ada8a1347209a5"
        `);
    await queryRunner.query(`
            ALTER TABLE "door_block" DROP CONSTRAINT "FK_d148b102b6b874ab4e34ce2a4ce"
        `);
    await queryRunner.query(`
            ALTER TABLE "land" DROP CONSTRAINT "FK_8881982e557d3f2119abf6b0bde"
        `);
    await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN "updatedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN "createdAt"
        `);
    await queryRunner.query(`
            DROP TABLE "block_entry"
        `);
    await queryRunner.query(`
            DROP TABLE "door_block"
        `);
    await queryRunner.query(`
            DROP TABLE "land"
        `);
    await queryRunner.query(`
            DROP TABLE "land_assets"
        `);
  }
}

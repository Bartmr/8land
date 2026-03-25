import { MigrationInterface, QueryRunner } from 'typeorm';

export class NFTMetadata1645870824982 implements MigrationInterface {
  name = 'NFTMetadata1645870824982';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "territory"
            ADD "tokenId" text
        `);

    await queryRunner.query(`
            ALTER TABLE "territory"
            ADD "tokenAddress" text
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "territory" DROP COLUMN "tokenAddress"
        `);

    await queryRunner.query(`
            ALTER TABLE "territory" DROP COLUMN "tokenId"
        `);
  }
}

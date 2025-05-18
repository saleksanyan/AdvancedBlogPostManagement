import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1745820096210 implements MigrationInterface {
  name = "Migration1745820096210";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "verification_code" ADD "attemp_count" integer NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "verification_code" DROP COLUMN "attemp_count"`,
    );
  }
}

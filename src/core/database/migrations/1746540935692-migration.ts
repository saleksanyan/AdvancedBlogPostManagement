import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1746540935692 implements MigrationInterface {
  name = "Migration1746540935692";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."blog_post_mode_enum" AS ENUM('private', 'public')`,
    );
    await queryRunner.query(
      `ALTER TABLE "blog_post" ADD "mode" "public"."blog_post_mode_enum" NOT NULL DEFAULT 'public'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "blog_post" DROP COLUMN "mode"`);
    await queryRunner.query(`DROP TYPE "public"."blog_post_mode_enum"`);
  }
}

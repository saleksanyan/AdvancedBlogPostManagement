import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1746385231779 implements MigrationInterface {
  name = "Migration1746385231779";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."blog_post_mood_enum" AS ENUM('sad', 'happy', 'excited', 'calm', 'angry')`,
    );
    await queryRunner.query(
      `ALTER TABLE "blog_post" ADD "mood" "public"."blog_post_mood_enum" NOT NULL DEFAULT 'calm'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "blog_post" DROP COLUMN "mood"`);
    await queryRunner.query(`DROP TYPE "public"."blog_post_mood_enum"`);
  }
}

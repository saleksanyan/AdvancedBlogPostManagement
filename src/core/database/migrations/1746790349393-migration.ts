import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1746790349393 implements MigrationInterface {
  name = "Migration1746790349393";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."blog_post_mood_enum" RENAME TO "blog_post_mood_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."blog_post_mood_enum" AS ENUM('sad', 'happy', 'excited', 'neutral', 'angry', 'creative')`,
    );
    await queryRunner.query(
      `ALTER TABLE "blog_post" ALTER COLUMN "mood" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "blog_post" ALTER COLUMN "mood" TYPE "public"."blog_post_mood_enum" USING "mood"::"text"::"public"."blog_post_mood_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "blog_post" ALTER COLUMN "mood" SET DEFAULT 'neutral'`,
    );
    await queryRunner.query(`DROP TYPE "public"."blog_post_mood_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."blog_post_mood_enum_old" AS ENUM('sad', 'happy', 'excited', 'calm', 'angry')`,
    );
    await queryRunner.query(
      `ALTER TABLE "blog_post" ALTER COLUMN "mood" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "blog_post" ALTER COLUMN "mood" TYPE "public"."blog_post_mood_enum_old" USING "mood"::"text"::"public"."blog_post_mood_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "blog_post" ALTER COLUMN "mood" SET DEFAULT 'calm'`,
    );
    await queryRunner.query(`DROP TYPE "public"."blog_post_mood_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."blog_post_mood_enum_old" RENAME TO "blog_post_mood_enum"`,
    );
  }
}

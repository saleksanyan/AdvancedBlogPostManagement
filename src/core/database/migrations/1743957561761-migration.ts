import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1743957561761 implements MigrationInterface {
  name = "Migration1743957561761";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "blog_post" ADD CONSTRAINT "UQ_98af2a19f78d0522c833dda0d7e" UNIQUE ("title")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "blog_post" DROP CONSTRAINT "UQ_98af2a19f78d0522c833dda0d7e"`,
    );
  }
}

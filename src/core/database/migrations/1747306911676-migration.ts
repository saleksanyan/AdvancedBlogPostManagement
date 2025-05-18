import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1747306911676 implements MigrationInterface {
  name = "Migration1747306911676";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "notification_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "message" character varying NOT NULL, "is_read" boolean NOT NULL DEFAULT false, "type" character varying NOT NULL, "link" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "PK_112676de71a3a708b914daed289" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification_entity" ADD CONSTRAINT "FK_0b8d70584f85c72fca6fd277bb8" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notification_entity" DROP CONSTRAINT "FK_0b8d70584f85c72fca6fd277bb8"`,
    );
    await queryRunner.query(`DROP TABLE "notification_entity"`);
  }
}

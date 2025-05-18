import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1743927654517 implements MigrationInterface {
  name = "Migration1743927654517";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."verification_code_status_enum" AS ENUM('active', 'inactive', 'verified')`,
    );
    await queryRunner.query(
      `CREATE TABLE "verification_code" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying(10) NOT NULL, "status" "public"."verification_code_status_enum" NOT NULL, "expires_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "PK_d702c086da466e5d25974512d46" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "access_token" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "token" text NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "PK_f20f028607b2603deabd8182d12" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "verification_code" ADD CONSTRAINT "FK_20dc9f8d86616620881be140833" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "access_token" ADD CONSTRAINT "FK_4bd9bc00776919370526766eb43" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "access_token" DROP CONSTRAINT "FK_4bd9bc00776919370526766eb43"`,
    );
    await queryRunner.query(
      `ALTER TABLE "verification_code" DROP CONSTRAINT "FK_20dc9f8d86616620881be140833"`,
    );
    await queryRunner.query(`DROP TABLE "access_token"`);
    await queryRunner.query(`DROP TABLE "verification_code"`);
    await queryRunner.query(
      `DROP TYPE "public"."verification_code_status_enum"`,
    );
  }
}

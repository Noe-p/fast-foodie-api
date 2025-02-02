import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1736924130786 implements MigrationInterface {
    name = 'Migrations1736924130786'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "media" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "url" character varying NOT NULL, "localPath" character varying NOT NULL DEFAULT '', "filename" character varying NOT NULL DEFAULT '', "type" character varying NOT NULL, "size" integer NOT NULL, "dishId" uuid, CONSTRAINT "PK_f4e0fcac36e050de337b670d8bd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "food" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "aisle" character varying NOT NULL, "icon" character varying NOT NULL, "userId" uuid, CONSTRAINT "PK_26d12de4b6576ff08d30c281837" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userName" character varying NOT NULL, "password" character varying NOT NULL, "managerId" uuid, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."dish_status_enum" AS ENUM('PRIVATE', 'PUBLIC')`);
        await queryRunner.query(`CREATE TABLE "dish" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "instructions" character varying, "status" "public"."dish_status_enum" NOT NULL DEFAULT 'PUBLIC', "weeklyDish" boolean NOT NULL DEFAULT false, "tags" text array, "ration" integer NOT NULL DEFAULT '2', "favoriteImage" character varying, "chefId" uuid NOT NULL, CONSTRAINT "PK_59ac7b35af39b231276bfc4c00c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ingredient" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "quantity" character varying NOT NULL, "foodId" uuid, "dishId" uuid, CONSTRAINT "PK_6f1e945604a0b59f56a57570e98" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "media" ADD CONSTRAINT "FK_128abc0f24534d6f32ba699dc95" FOREIGN KEY ("dishId") REFERENCES "dish"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "food" ADD CONSTRAINT "FK_5ed8e55796b747240eff8d82b8a" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_df69481de1f438f2082e4d54749" FOREIGN KEY ("managerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "dish" ADD CONSTRAINT "FK_8d7bf18dc0b2cdc04267c240b6f" FOREIGN KEY ("chefId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ingredient" ADD CONSTRAINT "FK_04fb9dfaa7954d6aad75f5e406e" FOREIGN KEY ("foodId") REFERENCES "food"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ingredient" ADD CONSTRAINT "FK_7c9b1a5446b05b56654617af02c" FOREIGN KEY ("dishId") REFERENCES "dish"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ingredient" DROP CONSTRAINT "FK_7c9b1a5446b05b56654617af02c"`);
        await queryRunner.query(`ALTER TABLE "ingredient" DROP CONSTRAINT "FK_04fb9dfaa7954d6aad75f5e406e"`);
        await queryRunner.query(`ALTER TABLE "dish" DROP CONSTRAINT "FK_8d7bf18dc0b2cdc04267c240b6f"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_df69481de1f438f2082e4d54749"`);
        await queryRunner.query(`ALTER TABLE "food" DROP CONSTRAINT "FK_5ed8e55796b747240eff8d82b8a"`);
        await queryRunner.query(`ALTER TABLE "media" DROP CONSTRAINT "FK_128abc0f24534d6f32ba699dc95"`);
        await queryRunner.query(`DROP TABLE "ingredient"`);
        await queryRunner.query(`DROP TABLE "dish"`);
        await queryRunner.query(`DROP TYPE "public"."dish_status_enum"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "food"`);
        await queryRunner.query(`DROP TABLE "media"`);
    }

}

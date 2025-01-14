import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1736485109369 implements MigrationInterface {
    name = 'Migrations1736485109369'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "ingredient" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "quantity" character varying NOT NULL, "ration" integer NOT NULL DEFAULT '2', "foodId" uuid, CONSTRAINT "PK_6f1e945604a0b59f56a57570e98" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "ingredient" ADD CONSTRAINT "FK_04fb9dfaa7954d6aad75f5e406e" FOREIGN KEY ("foodId") REFERENCES "food"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ingredient" DROP CONSTRAINT "FK_04fb9dfaa7954d6aad75f5e406e"`);
        await queryRunner.query(`DROP TABLE "ingredient"`);
    }

}

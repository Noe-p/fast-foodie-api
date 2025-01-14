import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1736482131018 implements MigrationInterface {
    name = 'Migrations1736482131018'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "food" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "aisle" character varying NOT NULL, "icon" character varying NOT NULL, "userId" uuid, CONSTRAINT "PK_26d12de4b6576ff08d30c281837" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "food" ADD CONSTRAINT "FK_5ed8e55796b747240eff8d82b8a" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "food" DROP CONSTRAINT "FK_5ed8e55796b747240eff8d82b8a"`);
        await queryRunner.query(`DROP TABLE "food"`);
    }

}

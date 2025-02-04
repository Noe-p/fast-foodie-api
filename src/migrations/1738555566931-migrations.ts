import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1738555566931 implements MigrationInterface {
    name = 'Migrations1738555566931'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_collaborators_collaborator" ("userId" uuid NOT NULL, "collaboratorId" uuid NOT NULL, CONSTRAINT "PK_571c101a1952345f0eb7d61bc78" PRIMARY KEY ("userId", "collaboratorId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_1ee1ebc6165ee2dc4cb3c073dc" ON "user_collaborators_collaborator" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_e6096d686b1a6bb1cefb39f843" ON "user_collaborators_collaborator" ("collaboratorId") `);
        await queryRunner.query(`ALTER TABLE "user_collaborators_collaborator" ADD CONSTRAINT "FK_1ee1ebc6165ee2dc4cb3c073dc4" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_collaborators_collaborator" ADD CONSTRAINT "FK_e6096d686b1a6bb1cefb39f843e" FOREIGN KEY ("collaboratorId") REFERENCES "collaborator"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_collaborators_collaborator" DROP CONSTRAINT "FK_e6096d686b1a6bb1cefb39f843e"`);
        await queryRunner.query(`ALTER TABLE "user_collaborators_collaborator" DROP CONSTRAINT "FK_1ee1ebc6165ee2dc4cb3c073dc4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e6096d686b1a6bb1cefb39f843"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1ee1ebc6165ee2dc4cb3c073dc"`);
        await queryRunner.query(`DROP TABLE "user_collaborators_collaborator"`);
    }

}

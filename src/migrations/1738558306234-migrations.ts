import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1738558306234 implements MigrationInterface {
    name = 'Migrations1738558306234'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_collaborators_collaborator" DROP CONSTRAINT "FK_e6096d686b1a6bb1cefb39f843e"`);
        await queryRunner.query(`ALTER TABLE "food" DROP CONSTRAINT "FK_5ed8e55796b747240eff8d82b8a"`);
        await queryRunner.query(`ALTER TABLE "food" ALTER COLUMN "userId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "food" ADD CONSTRAINT "FK_5ed8e55796b747240eff8d82b8a" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_collaborators_collaborator" ADD CONSTRAINT "FK_e6096d686b1a6bb1cefb39f843e" FOREIGN KEY ("collaboratorId") REFERENCES "collaborator"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_collaborators_collaborator" DROP CONSTRAINT "FK_e6096d686b1a6bb1cefb39f843e"`);
        await queryRunner.query(`ALTER TABLE "food" DROP CONSTRAINT "FK_5ed8e55796b747240eff8d82b8a"`);
        await queryRunner.query(`ALTER TABLE "food" ALTER COLUMN "userId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "food" ADD CONSTRAINT "FK_5ed8e55796b747240eff8d82b8a" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_collaborators_collaborator" ADD CONSTRAINT "FK_e6096d686b1a6bb1cefb39f843e" FOREIGN KEY ("collaboratorId") REFERENCES "collaborator"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}

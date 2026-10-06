import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialFinanceDomain1767657600000 implements MigrationInterface {
  name = 'InitialFinanceDomain1767657600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
    await queryRunner.query(
      "CREATE TYPE \"public\".\"financial_account_type\" AS ENUM ('bank', 'credit_card', 'cash', 'other')",
    );
    await queryRunner.query(
      "CREATE TYPE \"public\".\"category_type\" AS ENUM ('income', 'expense', 'transfer')",
    );
    await queryRunner.query(
      "CREATE TYPE \"public\".\"transaction_type\" AS ENUM ('income', 'expense', 'transfer')",
    );
    await queryRunner.query(
      "CREATE TYPE \"public\".\"transaction_source_type\" AS ENUM ('manual', 'statement', 'receipt')",
    );
    await queryRunner.query(
      'CREATE TYPE "public"."transaction_status" AS ENUM (\'pending_review\', \'confirmed\')',
    );

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "email" character varying(320) NOT NULL,
        "password_hash" character varying NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_users_email" ON "users" ("email")',
    );

    await queryRunner.query(`
      CREATE TABLE "financial_accounts" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "name" character varying(120) NOT NULL,
        "type" "public"."financial_account_type" NOT NULL,
        "currency" character(3) NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_financial_accounts_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_financial_accounts_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      'CREATE INDEX "IDX_financial_accounts_user_id" ON "financial_accounts" ("user_id")',
    );

    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid,
        "name" character varying(120) NOT NULL,
        "type" "public"."category_type" NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_categories_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_categories_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(
      'CREATE INDEX "IDX_categories_user_type_name" ON "categories" ("user_id", "type", "name")',
    );

    await queryRunner.query(`
      CREATE TABLE "transactions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "account_id" uuid NOT NULL,
        "category_id" uuid,
        "amount" numeric(20,6) NOT NULL,
        "currency" character(3) NOT NULL,
        "type" "public"."transaction_type" NOT NULL,
        "description" text NOT NULL,
        "merchant" character varying(255),
        "transaction_date" date NOT NULL,
        "source_type" "public"."transaction_source_type" NOT NULL,
        "status" "public"."transaction_status" NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_transactions_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_transactions_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_transactions_account" FOREIGN KEY ("account_id") REFERENCES "financial_accounts"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_transactions_category" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(
      'CREATE INDEX "IDX_transactions_user_date" ON "transactions" ("user_id", "transaction_date")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_transactions_account_date" ON "transactions" ("account_id", "transaction_date")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_transactions_user_status" ON "transactions" ("user_id", "status")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "transactions"');
    await queryRunner.query('DROP TABLE "categories"');
    await queryRunner.query('DROP TABLE "financial_accounts"');
    await queryRunner.query('DROP TABLE "users"');
    await queryRunner.query('DROP TYPE "public"."transaction_status"');
    await queryRunner.query('DROP TYPE "public"."transaction_source_type"');
    await queryRunner.query('DROP TYPE "public"."transaction_type"');
    await queryRunner.query('DROP TYPE "public"."category_type"');
    await queryRunner.query('DROP TYPE "public"."financial_account_type"');
  }
}

import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260211111729 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "booking_rule" ("id" text not null, "name" text not null, "description" text null, "scope" text check ("scope" in ('global', 'resource')) not null default 'global', "booking_resource_ids" text[] null, "require_payment" boolean not null default true, "require_confirmation" boolean not null default false, "reservation_ttl_seconds" integer not null default 300, "configuration" jsonb null, "priority" integer not null default 0, "is_active" boolean not null default true, "valid_from" timestamptz null, "valid_until" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "booking_rule_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_booking_rule_deleted_at" ON "booking_rule" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`drop table if exists "booking_setting" cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`create table if not exists "booking_setting" ("id" text not null, "scope" text check ("scope" in ('global', 'resource')) not null default 'global', "booking_resource_id" text null, "require_payment" boolean not null default true, "require_confirmation" boolean not null default false, "reservation_ttl_seconds" integer not null default 300, "configuration" jsonb null, "priority" integer not null default 0, "is_active" boolean not null default true, "valid_from" timestamptz null, "valid_until" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "booking_setting_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_booking_setting_deleted_at" ON "booking_setting" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`drop table if exists "booking_rule" cascade;`);
  }

}

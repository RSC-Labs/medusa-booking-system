import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260128115337 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "booking_resource_availability_rule" drop constraint if exists "booking_resource_availability_rule_priority_unique";`);
    this.addSql(`alter table if exists "booking_resource_availability_rule" drop constraint if exists "booking_resource_availability_rule_name_unique";`);
    this.addSql(`alter table if exists "booking_resource_allocation" drop constraint if exists "booking_resource_allocation_booking_line_item_id_unique";`);
    this.addSql(`alter table if exists "booking_resource_allocation" drop constraint if exists "booking_resource_allocation_booking_cart_item_id_unique";`);
    this.addSql(`create table if not exists "booking" ("id" text not null, "booking_number" text not null, "order_id" text not null, "start_time" timestamptz not null, "end_time" timestamptz not null, "status" text check ("status" in ('pending', 'confirmed', 'completed', 'cancelled')) not null default 'pending', "confirmed_at" timestamptz null, "cancelled_at" timestamptz null, "completed_at" timestamptz null, "reserved_at" timestamptz null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "booking_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_booking_deleted_at" ON "booking" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "booking_cart_item" ("id" text not null, "cart_id" text not null, "cart_line_item_id" text not null, "start_time" timestamptz null, "end_time" timestamptz null, "status" text check ("status" in ('reserved', 'expired', 'converted')) not null, "expires_at" timestamptz null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "booking_cart_item_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_booking_cart_item_deleted_at" ON "booking_cart_item" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "booking_line_item" ("id" text not null, "booking_id" text not null, "start_time" timestamptz not null, "end_time" timestamptz not null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "booking_line_item_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_booking_line_item_booking_id" ON "booking_line_item" ("booking_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_booking_line_item_deleted_at" ON "booking_line_item" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "booking_resource" ("id" text not null, "product_id" text not null, "status" text check ("status" in ('draft', 'published')) not null default 'draft', "resource_type" text not null, "is_bookable" boolean not null default true, "title" text not null, "subtitle" text null, "description" text null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "booking_resource_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_booking_resource_deleted_at" ON "booking_resource" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "booking_resource_allocation" ("id" text not null, "booking_cart_item_id" text null, "booking_line_item_id" text null, "booking_resource_id" text not null, "start_time" timestamptz not null, "end_time" timestamptz not null, "expires_at" timestamptz null, "status" text check ("status" in ('hold', 'reserved', 'confirmed', 'cancelled')) not null, "cancellation_reason" text null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "booking_resource_allocation_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_booking_resource_allocation_booking_cart_item_id_unique" ON "booking_resource_allocation" ("booking_cart_item_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_booking_resource_allocation_booking_line_item_id_unique" ON "booking_resource_allocation" ("booking_line_item_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_booking_resource_allocation_booking_resource_id" ON "booking_resource_allocation" ("booking_resource_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_booking_resource_allocation_deleted_at" ON "booking_resource_allocation" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "booking_resource_availability_rule" ("id" text not null, "booking_resource_id" text not null, "rule_type" text not null, "name" text not null, "description" text null, "effect" text check ("effect" in ('available', 'unavailable')) not null default 'available', "priority" integer not null default 0, "valid_from" timestamptz null, "valid_until" timestamptz null, "configuration" jsonb not null, "is_active" boolean not null default true, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "booking_resource_availability_rule_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_booking_resource_availability_rule_booking_resource_id" ON "booking_resource_availability_rule" ("booking_resource_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_booking_resource_availability_rule_name_unique" ON "booking_resource_availability_rule" ("name") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_booking_resource_availability_rule_priority_unique" ON "booking_resource_availability_rule" ("priority") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_booking_resource_availability_rule_deleted_at" ON "booking_resource_availability_rule" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "booking_resource_pricing_config" ("id" text not null, "product_variant_id" text not null, "booking_resource_id" text not null, "unit" text check ("unit" in ('second', 'minute', 'hour', 'day', 'custom')) not null, "unit_value" integer not null default 60, "product_variant_title" text null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "booking_resource_pricing_config_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_booking_resource_pricing_config_booking_resource_id" ON "booking_resource_pricing_config" ("booking_resource_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_booking_resource_pricing_config_deleted_at" ON "booking_resource_pricing_config" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "booking_setting" ("id" text not null, "scope" text check ("scope" in ('global', 'resource')) not null default 'global', "booking_resource_id" text null, "require_payment" boolean not null default true, "require_confirmation" boolean not null default false, "reservation_ttl_seconds" integer not null default 300, "configuration" jsonb null, "priority" integer not null default 0, "is_active" boolean not null default true, "valid_from" timestamptz null, "valid_until" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "booking_setting_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_booking_setting_deleted_at" ON "booking_setting" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "booking_line_item" add constraint "booking_line_item_booking_id_foreign" foreign key ("booking_id") references "booking" ("id") on update cascade;`);

    this.addSql(`alter table if exists "booking_resource_allocation" add constraint "booking_resource_allocation_booking_cart_item_id_foreign" foreign key ("booking_cart_item_id") references "booking_cart_item" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table if exists "booking_resource_allocation" add constraint "booking_resource_allocation_booking_line_item_id_foreign" foreign key ("booking_line_item_id") references "booking_line_item" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table if exists "booking_resource_allocation" add constraint "booking_resource_allocation_booking_resource_id_foreign" foreign key ("booking_resource_id") references "booking_resource" ("id") on update cascade on delete cascade;`);

    this.addSql(`alter table if exists "booking_resource_availability_rule" add constraint "booking_resource_availability_rule_booking_resource_id_foreign" foreign key ("booking_resource_id") references "booking_resource" ("id") on update cascade on delete cascade;`);

    this.addSql(`alter table if exists "booking_resource_pricing_config" add constraint "booking_resource_pricing_config_booking_resource_id_foreign" foreign key ("booking_resource_id") references "booking_resource" ("id") on update cascade on delete cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "booking_line_item" drop constraint if exists "booking_line_item_booking_id_foreign";`);

    this.addSql(`alter table if exists "booking_resource_allocation" drop constraint if exists "booking_resource_allocation_booking_cart_item_id_foreign";`);

    this.addSql(`alter table if exists "booking_resource_allocation" drop constraint if exists "booking_resource_allocation_booking_line_item_id_foreign";`);

    this.addSql(`alter table if exists "booking_resource_allocation" drop constraint if exists "booking_resource_allocation_booking_resource_id_foreign";`);

    this.addSql(`alter table if exists "booking_resource_availability_rule" drop constraint if exists "booking_resource_availability_rule_booking_resource_id_foreign";`);

    this.addSql(`alter table if exists "booking_resource_pricing_config" drop constraint if exists "booking_resource_pricing_config_booking_resource_id_foreign";`);

    this.addSql(`drop table if exists "booking" cascade;`);

    this.addSql(`drop table if exists "booking_cart_item" cascade;`);

    this.addSql(`drop table if exists "booking_line_item" cascade;`);

    this.addSql(`drop table if exists "booking_resource" cascade;`);

    this.addSql(`drop table if exists "booking_resource_allocation" cascade;`);

    this.addSql(`drop table if exists "booking_resource_availability_rule" cascade;`);

    this.addSql(`drop table if exists "booking_resource_pricing_config" cascade;`);

    this.addSql(`drop table if exists "booking_setting" cascade;`);
  }

}

-- Up Migration
CREATE TABLE "producers" (
  "id_producer" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "username" varchar NOT NULL,
  "email" varchar UNIQUE NOT NULL,
  "password_hash" varchar NOT NULL,
  "role" varchar NOT NULL DEFAULT 'USER',
  "created_at" timestamp DEFAULT NOW(),
  "updated_at" timestamp
);


CREATE TABLE "properties" (
  "id_property" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "id_producer" UUID NOT NULL,
  "name" varchar NOT NULL,
  "city" varchar NOT NULL,
  "state" varchar NOT NULL,
  "total_area" integer NOT NULL, 
  "arable_area" integer NOT NULL,
  "vegetation_area" integer NOT NULL,
  "created_at" timestamp DEFAULT NOW(),
  "updated_at" timestamp,

  CONSTRAINT fk_properties_producers
    FOREIGN KEY ("id_producer")
    REFERENCES "producers" ("id_producer")
    ON DELETE CASCADE
);


CREATE TABLE "cultures" (
  "id_culture" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "id_property" UUID NOT NULL,
  "name" varchar UNIQUE NOT NULL,
  "allocated_area" integer DEFAULT 0,
  "created_at" timestamp DEFAULT NOW(),
  "updated_at" timestamp,

  CONSTRAINT fk_cultures_producers
    FOREIGN KEY ("id_property")
    REFERENCES "properties" ("id_property")
    ON DELETE CASCADE
);


CREATE TABLE "crops" (
  "id_crop" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "id_culture" UUID NOT NULL,
  "harvest_year" varchar(9) NOT NULL,
  "status" varchar NOT NULL,
  "allocated_area" integer NOT NULL,
  "harvest_date_expected" timestamp NOT NULL,
  "harvest_date_actual" timestamp,
  "status_pest" varchar NOT NULL,
  "created_at" timestamp DEFAULT NOW(),
  "updated_at" timestamp,

  CONSTRAINT fk_crops_cultures
    FOREIGN KEY ("id_culture")
    REFERENCES "cultures" ("id_culture")
    ON DELETE CASCADE
);
-- Down Migration

DROP TABLE IF EXISTS "crops";
DROP TABLE IF EXISTS "cultures";
DROP TABLE IF EXISTS "properties";
DROP TABLE IF EXISTS "producers";
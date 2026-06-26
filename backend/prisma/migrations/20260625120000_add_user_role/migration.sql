-- Ajout du rôle utilisateur (admin vs client) sans toucher aux autres colonnes.
DO $$ BEGIN
  CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" "UserRole" NOT NULL DEFAULT 'USER';

UPDATE "User" SET "role" = 'ADMIN' WHERE email = 'admin@pokemon.local';

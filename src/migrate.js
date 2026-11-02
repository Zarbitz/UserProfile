import { getMigrations } from 'better-auth/db/migration';
import { auth,db } from './auth.js';
const {runMigrations}=await getMigrations(auth.options);await runMigrations();
await db.query(`CREATE TABLE IF NOT EXISTS profiles(user_id text PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE, organization text NOT NULL DEFAULT '', status text NOT NULL DEFAULT 'pending', preferences jsonb NOT NULL DEFAULT '{}');
CREATE TABLE IF NOT EXISTS assets(id uuid PRIMARY KEY, user_id text NOT NULL REFERENCES "user"(id), service text NOT NULL CHECK(service IN ('agri','dams','building')), name text NOT NULL, geometry jsonb NOT NULL, dataset_key text, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS reports(id uuid PRIMARY KEY, asset_id uuid NOT NULL REFERENCES assets(id), user_id text NOT NULL REFERENCES "user"(id), channel text NOT NULL, status text NOT NULL DEFAULT 'requested', created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS enquiries(id uuid PRIMARY KEY, details jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), notified boolean NOT NULL DEFAULT false);
CREATE INDEX IF NOT EXISTS assets_owner ON assets(user_id);`);await db.end();

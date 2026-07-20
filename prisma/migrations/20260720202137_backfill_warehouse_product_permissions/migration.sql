-- Backfill "warehouse" and "product" permissions into existing system-seeded roles.
-- roles.json only affects organizations created after this change, so any org
-- created earlier still has Role rows without these keys. Scoped to
-- created_by_type = 'SYSTEM' so any org-customized role sharing the same name
-- is left untouched.

UPDATE "roles"
SET "permissions" = "permissions" || '{"warehouse": ["read", "create", "update", "delete"], "product": ["read", "create", "update", "delete"]}'::jsonb
WHERE "name" = 'Owner' AND "created_by_type" = 'SYSTEM';

UPDATE "roles"
SET "permissions" = "permissions" || '{"warehouse": ["read", "create", "update", "delete"], "product": ["read", "create", "update", "delete"]}'::jsonb
WHERE "name" = 'Admin' AND "created_by_type" = 'SYSTEM';

UPDATE "roles"
SET "permissions" = "permissions" || '{"warehouse": ["read", "create", "update"], "product": ["read", "create", "update"]}'::jsonb
WHERE "name" = 'Manager' AND "created_by_type" = 'SYSTEM';

UPDATE "roles"
SET "permissions" = "permissions" || '{"warehouse": ["read"], "product": ["read"]}'::jsonb
WHERE "name" = 'Employee' AND "created_by_type" = 'SYSTEM';

UPDATE "roles"
SET "permissions" = "permissions" || '{"warehouse": ["read"], "product": ["read"]}'::jsonb
WHERE "name" = 'Viewer' AND "created_by_type" = 'SYSTEM';

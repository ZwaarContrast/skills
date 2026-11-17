-- State-like columns, CHECKs, enums and partial indexes of a replayed Postgres schema (replay-pg.mjs runs it).
SELECT c.table_name, c.column_name, c.data_type, coalesce(c.column_default,'')
FROM information_schema.columns c JOIN information_schema.tables t USING (table_schema, table_name)
WHERE c.table_schema='public' AND t.table_type='BASE TABLE'
  AND (c.column_name ~* '(status|state|phase|stage|step|mode)$|^(is|has|can)_|_at$' AND c.column_name NOT IN ('created_at','updated_at') OR c.data_type='boolean' OR c.udt_name IN (SELECT typname FROM pg_type WHERE typtype='e'))
UNION ALL
SELECT conrelid::regclass::text, '(check)', '', pg_get_constraintdef(oid) FROM pg_constraint WHERE contype='c' AND connamespace='public'::regnamespace AND conrelid::regclass::text <> 'spatial_ref_sys'
UNION ALL
SELECT t.typname, '(enum)', '', string_agg(e.enumlabel, ',' ORDER BY e.enumsortorder) FROM pg_type t JOIN pg_enum e ON e.enumtypid=t.oid GROUP BY t.typname
UNION ALL
SELECT tablename, '(partial index)', '', indexdef FROM pg_indexes WHERE schemaname='public' AND indexdef ~* ' where '
ORDER BY 1,2

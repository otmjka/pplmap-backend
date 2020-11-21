/*
  schemaName: string
*/

WITH
  objects_count AS MATERIALIZED (
    SELECT count(*) AS count
    FROM pg_class JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
    WHERE pg_namespace.nspname = ${schemaName}
  )

SELECT
  ((SELECT count FROM objects_count) = 0)::BOOLEAN AS is_empty
;

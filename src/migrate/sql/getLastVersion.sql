/*
  schemaName: string
*/

WITH last_db_version AS MATERIALIZED (
  SELECT
    to_version AS last_version
  FROM ${schemaName:raw}.migrations
  ORDER BY created_at DESC
  LIMIT 1
)

SELECT
  COALESCE (
    (SELECT last_version FROM last_db_version),
    '000'
  ) AS last_version
;

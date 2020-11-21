/*
  schemaName: string
*/

CREATE TABLE ${schemaName:raw}.migrations (
  id SERIAL PRIMARY KEY,
  from_version TEXT NOT NULL,
  to_version TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_by_instance_id TEXT NOT NULL,
  created_by_service_version TEXT NOT NULL
);

SELECT 'OK' AS response;

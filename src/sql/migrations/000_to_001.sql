CREATE TABLE IF NOT EXISTS persons (
  id BIGSERIAL PRIMARY KEY,
  person_name VARCHAR NOT NULL,
  birthday TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
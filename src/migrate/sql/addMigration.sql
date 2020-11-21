/*
  from_version: string
  to_version: string
  instance_id: string
  service_version: string
*/

INSERT INTO migrations(
  from_version,
  to_version,
  created_by_instance_id,
  created_by_service_version
) VALUES (
  ${from_version},
  ${to_version},
  ${instance_id},
  ${service_version}
);

INSERT INTO
  persons (person_name, birthday)
VALUES
  (${person_name}, ${birthday})
ON CONFLICT DO NOTHING;
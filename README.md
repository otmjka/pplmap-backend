npx express --git backend

git remote add origin https://github.com/otmjka/pplmap-backend.git
https://gist.github.com/subfuzion/08c5d85437d5d4f00e58

curl -d '{"name":"dima", "birthday":495136800000}' -H "Content-Type: application/json" -X POST localhost:3001/persons/add --verbose

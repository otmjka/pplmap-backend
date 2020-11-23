npx express --git backend

git remote add origin https://github.com/otmjka/pplmap-backend.git
https://gist.github.com/subfuzion/08c5d85437d5d4f00e58

===

git push https://otmjka@github.com/otmjka/pplmap-backend.git

===

curl -d '{"name":"dima", "birthday":495136800000}' -H "Content-Type: application/json" -X POST localhost:3001/persons/add --verbose

1. deploy app to heroku

### benefits wished

- free for try
- postgres service
- automation, deploy by one command

steps:

- build ts app to node version
- try in docker
- build app docker try run
- how to set env variables

```
npx tsc --noEmit false
```

```
ENVIRONMENT=local PORT=3001 POSTGRES_URI='postgres://postgres:postgres@127.0.0.1:5432/postgres' node build/index.js
```

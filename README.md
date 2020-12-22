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

## typescript

build js

```
npx tsc --noEmit false
```

```
ENVIRONMENT=local PORT=3001 POSTGRES_URI='postgres://postgres:postgres@127.0.0.1:5432/postgres' node build/index.js
```

## docker

-[heroku docker](https://docs.docker.com/engine/reference/builder/)

```
ENV PORT=3001
ENV POSTGRES_URI=postgres://postgres:postgres@host.docker.internal:5432/postgres
ENV ENVIRONMENT=production
ENV LOG_LEVEL=debug

docker build -t pplmap-backend-000:latest .

// ENV POSTGRES_URI=postgres://postgres:postgres@host.docker.internal:5432/postgres
```

```bash
docker run --rm -it -e DATABASE_URL='host.docker.internal:5432' -e ENVIRONMENT=local -e PORT=3001 -e DB_NAME=postgres -e DB_PASSWORD=postgres -e DB_USER=postgres pplmap-backend-000:latest /bin/bash
```

## docker get access to localhost postgres on mac

- [docker get access to localhost postgres on mac](https://docs.docker.com/docker-for-mac/networking/#i-want-to-connect-from-a-container-to-a-service-on-the-host)

## heroku

### push to heroku

```bash
docker build -t pplmap-backend-000:latest .
heroku container:push web

```

- [setup postgres service](https://devcenter.heroku.com/articles/heroku-postgresql#provisioning-heroku-postgres)
- [heroku docker](https://devcenter.heroku.com/articles/container-registry-and-runtime)

## Express cors

- (Handling CORS with Node.js)[https://stackabuse.com/handling-cors-with-node-js/]

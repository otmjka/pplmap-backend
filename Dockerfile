FROM node:12 as builder
WORKDIR /builder
COPY . .

RUN npm install --production\
  && npm install tsc -g\
  && node_modules/.bin/tsc --noEmit false

FROM node:12-slim
WORKDIR /app
COPY --from=builder --chown=node:node /builder .
RUN chown node:node /app
USER node

ENV ENVIRONMENT=stage
ENV PORT=3000

CMD ["node", "src/index.js"]
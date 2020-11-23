FROM node:12 as builder
WORKDIR /builder
COPY . .

RUN npm install --production

FROM node:12-slim
WORKDIR /app
COPY --from=builder --chown=node:node /builder .
RUN chown node:node /app
USER node

ENV PORT=3001
ENV POSTGRES_URI=postgres://postgres:postgres@host.docker.internal:5432/postgres
ENV ENVIRONMENT=production
ENV LOG_LEVEL=debug

EXPOSE 3001
CMD ["node", "index.js"]
FROM node:12 as builder
WORKDIR /builder
COPY . .

RUN npm install --production

FROM node:12-slim
WORKDIR /app
COPY --from=builder --chown=node:node /builder .
RUN chown node:node /app
USER node

EXPOSE 3001
CMD ["node", "index.js"]
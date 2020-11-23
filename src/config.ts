import * as env from 'env-var';

export default () => ({
  environment: env
    .get('ENVIRONMENT')
    .required()
    .asEnum(['local', 'test', 'stage', 'production']),
  port: env.get('PORT').required().asPortNumber(),
  dbName: env.get('DB_NAME').required().asString(),
  dbPassword: env.get('DB_PASSWORD').required().asString(),
  dbUser: env.get('DB_USER').required().asString(),
  databaseUrl: env.get('DATABASE_URL').required().asUrlString(),
  postgresUri: env.get('POSTGRES_URI').required().asUrlString(),
});

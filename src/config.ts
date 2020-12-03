import * as env from 'env-var';

export default () => ({
  environment: env
    .get('ENVIRONMENT')
    .required()
    .asEnum(['local', 'test', 'stage', 'production']),
  port: env.get('PORT').required().asPortNumber(),
  databaseUrl: env.get('DATABASE_URL').required().asString(), // asUrlString()
});

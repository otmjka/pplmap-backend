import * as env from 'env-var';

export default () => ({
  environment: env
    .get('ENVIRONMENT')
    .required()
    .asEnum(['local', 'test', 'stage', 'production']),
  port: env.get('PORT').required().asPortNumber(),
  postgresUri: env.get('POSTGRES_URI').required().asUrlString(),
});

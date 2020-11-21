import Db from './Db';
import HttpServer from './HttpServer';
import getConfig from './config';
import migrate from './migrate/migrate';

let config;

try {
  config = getConfig();
} catch (error) {
  // eslint-disable-next-line no-console, @typescript-eslint/no-unsafe-member-access
  console.error({ msg: 'misconfiguration', error_message: error.message });
  process.exit(1);
}
if (!config) {
  // eslint-disable-next-line no-console
  console.error({ msg: 'misconfiguration', error_message: 'empty config' });
  process.exit(1);
}

const db = new Db({
  connectionString: config.postgresUri,
});

const httpServer = new HttpServer({
  port: config.port,
  db,
});

(async (): Promise<void> => {
  try {
    await migrate({
      target: '001',
      pgpdb: db.db,
      migrationsPath: `${process.cwd()}/src/sql/migrations`,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error({
      msg: 'db_init_error',
      error_message: 'error while migration or create schema',
    });
    process.exit(1);
  }
  await httpServer.start();
})();

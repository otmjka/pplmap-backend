import { IDatabase } from 'pg-promise';
import pTimeout from 'p-timeout';

import Db from './Db';
import MigrationFiles from './MigrationFiles';

const MIGRATION_STEP_TIMEOUT_MS = 30 * 1000;

export default async ({
  pgpdb,
  schemaName = 'public',
  migrationsPath,
  target,
}: {
  pgpdb: IDatabase<Record<string, unknown>>;
  schemaName?: string;
  migrationsPath: string;
  target: string;
}): Promise<void> => {
  const db = new Db({ pgpdb, schemaName });
  const migrationFiles = new MigrationFiles(migrationsPath);
  const targetVersion =
    target === 'latest' ? migrationFiles.latestVersion : target;
  console.info({ msg: 'migration_start', targetVersion, schemaName });
  const dbEmpty = await db.isDatabaseEmpty();
  if (dbEmpty) {
    console.info({ msg: 'initializing_empty_database' });
    await db.createSchema();
  }
  const currentVersion = await db.getLastVersion();
  console.info({ msg: 'current_db_version', currentVersion });

  if (currentVersion === targetVersion) {
    console.info({ msg: 'no_migration_needed' });
    return;
  }

  if (targetVersion <= currentVersion) {
    console.error({
      msg: 'required_version_is_lower_than_current',
      targetVersion,
      currentVersion,
    });
    throw new Error('required_db_migration_version_is_lower_than_current');
  }

  const fileChain = migrationFiles.paths[currentVersion][targetVersion];
  if (!fileChain) {
    console.error({
      msg: 'impossible_migration',
      currentVersion,
      targetVersion,
      message:
        'Could not find a query chain to get from current version to target version',
    });
    throw new Error('Impossible migration');
  }

  console.info({ msg: 'executing_migration_chain', chain: fileChain });

  await db.runInTranscation(async (tx) => {
    console.info({ msg: 'recheking_current_version' });
    const version = await db.getLastVersion(tx);
    if (version !== currentVersion) {
      console.error({
        msg: 'current_version_recheck_failed',
        expectedVersion: currentVersion,
        version,
      });
      throw new Error('Bad version');
    }

    // eslint-disable-next-line no-loops/no-loops
    for (let i = 0; i < fileChain.length; i += 1) {
      const fileName = fileChain[i];
      const filePath = migrationFiles.migrationFilePaths[fileName];
      console.info({
        msg: 'executing_migration_step',
        fileName,
        filePath,
      });
      try {
        // eslint-disable-next-line no-await-in-loop
        await pTimeout(
          db.runQueryFromFile(filePath, tx),
          MIGRATION_STEP_TIMEOUT_MS,
        );
      } catch (error) {
        console.error({
          msg: 'migration_step_failed',
          fileName,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          error_message: error.message,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          error_stack: error.stack,
        });
        throw new Error('Migration step failed');
      }
    }

    console.info({ msg: 'adding_migration_record' });

    await db.addMigration(
      {
        from_version: version,
        to_version: targetVersion,
        instance_id: 'inst_id',
        service_version: '000',
      },
      tx,
    );
  });
  console.info({ msg: 'migration_complete', targetVersion });
};

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

  const dbEmpty = await db.isDatabaseEmpty();
  if (dbEmpty) {
    await db.createSchema();
  }
  const currentVersion = await db.getLastVersion();

  if (currentVersion === targetVersion) {
    return;
  }

  if (targetVersion <= currentVersion) {
    throw new Error('required_db_migration_version_is_lower_than_current');
  }

  const fileChain = migrationFiles.paths[currentVersion][targetVersion];
  if (!fileChain) {
    throw new Error('Impossible migration');
  }

  await db.runInTranscation(async (tx) => {
    const version = await db.getLastVersion(tx);
    if (version !== currentVersion) {
      throw new Error('Bad version');
    }

    // eslint-disable-next-line no-loops/no-loops
    for (let i = 0; i < fileChain.length; i += 1) {
      const fileName = fileChain[i];
      const filePath = migrationFiles.migrationFilePaths[fileName];
      try {
        // eslint-disable-next-line no-await-in-loop
        await pTimeout(
          db.runQueryFromFile(filePath, tx),
          MIGRATION_STEP_TIMEOUT_MS,
        );
      } catch (error) {
        throw new Error('Migration step failed');
      }
    }

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
};

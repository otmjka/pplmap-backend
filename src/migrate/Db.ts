import path from 'path';

import { IDatabase, QueryFile, ITask } from 'pg-promise';

const QUERY_NAMES = [
  'createSchema',
  'isDatabaseEmpty',
  'getLastVersion',
  'addMigration',
];
const QUERY_FILES_DIR = path.resolve(__dirname, 'sql');

export default class Db {
  pgpdb: IDatabase<Record<string, unknown>>;
  schemaName: string;
  queryFiles: { [queryName: string]: QueryFile };

  constructor({
    pgpdb,
    schemaName,
  }: {
    pgpdb: IDatabase<Record<string, unknown>>;
    schemaName: string;
  }) {
    this.pgpdb = pgpdb;
    this.schemaName = schemaName;

    this.queryFiles = {};
    this.loadQueryFiles();
  }

  loadQueryFiles(): void {
    QUERY_NAMES.forEach((queryName: string) => {
      const queryFile = new QueryFile(
        path.resolve(QUERY_FILES_DIR, `${queryName}.sql`),
        { noWarnings: true }, // Prevent duplicate QueryFile warnings; TODO: solve it
      );
      this.queryFiles[queryName] = queryFile;
    });
  }

  // eslint-disable-next-line class-methods-use-this
  async runQueryFromFile(
    filePath: string,
    tx: ITask<Record<string, unknown>>,
  ): Promise<void> {
    const queryFile = new QueryFile(filePath, { noWarnings: true });
    await tx.none(queryFile);
  }

  async runInTranscation(
    func: (tx: ITask<Record<string, unknown>>) => Promise<void>,
  ): Promise<void> {
    await this.pgpdb.tx(async (tx: ITask<Record<string, unknown>>) => {
      await tx.none(`SET SCHEMA '${this.schemaName}';`);
      await func(tx);
    });
  }

  async createSchema(): Promise<void> {
    type Result = { response: string };
    const result = await this.pgpdb.one<Result>(this.queryFiles.createSchema, {
      schemaName: this.schemaName,
    });
    if (result.response !== 'OK') {
      throw new Error('Schema creation error');
    }
  }

  async isDatabaseEmpty(): Promise<boolean> {
    type Result = { is_empty: boolean };
    const result = await this.pgpdb.one<Result>(
      this.queryFiles.isDatabaseEmpty,
      {
        schemaName: this.schemaName,
      },
    );
    return result.is_empty;
  }

  async getLastVersion(tx?: ITask<Record<string, unknown>>): Promise<string> {
    const t = tx || this.pgpdb;
    type Result = { last_version: string };
    const result = await t.one<Result>(this.queryFiles.getLastVersion, {
      schemaName: this.schemaName,
    });
    return result.last_version;
  }

  async addMigration(
    {
      from_version,
      to_version,
      instance_id,
      service_version,
    }: {
      from_version: string;
      to_version: string;
      instance_id: string;
      service_version: string;
    },
    tx: ITask<Record<string, unknown>>,
  ): Promise<void> {
    await tx.none(this.queryFiles.addMigration, {
      from_version,
      to_version,
      instance_id,
      service_version,
    });
  }
}

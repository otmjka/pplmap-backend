import path from 'path';
import { EventEmitter } from 'events';
import pgPromise, { IDatabase, QueryFile } from 'pg-promise';

const QUERY_NAMES = ['personsList', 'addPerson', 'flushPersons', 'deletePerson'];
const QUERY_FILES_DIR = path.resolve(__dirname, 'sql');

export default class Db extends EventEmitter {
  db: IDatabase<{}>;
  queryFiles: { [queryName: string]: QueryFile };

  constructor({
    databaseUrl,
  }: {
    databaseUrl: string;
  }) {
    super();
    const connectionString = databaseUrl; // `postgres://${dbUser}:${dbPassword}@${databaseUrl}/${dbName}`;
    this.db = pgPromise()(connectionString);

    this.queryFiles = {};
    this.loadQueryFiles();
  }

  loadQueryFiles(): void {
    QUERY_NAMES.forEach((queryName: string) => {
      const queryFile = new QueryFile(
        path.resolve(QUERY_FILES_DIR, `${queryName}.sql`),
      );
      this.queryFiles[queryName] = queryFile;
    });
  }

  async addPerson({
    person_name,
    birthday,
  }: {
    person_name: string;
    birthday: number;
  }): Promise<void> {
    await this.db.none(this.queryFiles.addPerson, {
      person_name,
      birthday: new Date(birthday),
    });
  }

  async deletePerson({
    id
  }: {id: string}): Promise<void> {
    await this.db.none(this.queryFiles.deletePerson, {
      id
    });
  }

  async personsList({
    skip,
    limit,
  }: {
    skip: number;
    limit: number;
  }): Promise<Array<{ id: string; person_name: string; bithday: Date }>> {
    return await this.db.manyOrNone<{
      id: string;
      person_name: string;
      bithday: Date;
    }>(this.queryFiles.personsList, {
      skip,
      limit,
    });
  }

  async flushPersons(): Promise<void> {
    await this.db.none(this.queryFiles.flushPersons, {});
  }
}

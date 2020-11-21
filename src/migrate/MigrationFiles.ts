import path from 'path';
import fs from 'fs';

import { Graph, alg } from 'graphlib';

export default class MigrationFiles {
  migrationFilePaths: Record<string, string> = {};
  versions: Array<string> = [];
  versionToVersions: Record<string, Array<string>> = {};
  versionsGraph: Graph;
  paths: Record<string, Record<string, Array<string>>> = {};
  latestVersion: string = '000';

  constructor(directoryPath: string) {
    this.readFiles(directoryPath);
    this.versionsGraph = new Graph({ directed: true });
    this.calcGraph();
    this.calcShortestPaths();
  }

  readFiles(directoryPath: string): void {
    const entries = fs.readdirSync(directoryPath);
    entries.forEach((fileName) => {
      const filePath = path.resolve(directoryPath, fileName);
      const stat = fs.lstatSync(filePath);
      if (!stat.isFile) {
        return;
      }
      const result = /^(\d{3})_to_(\d{3})\.sql$/.exec(fileName);
      if (!result) {
        return;
      }
      const from_version = result[1];
      const to_version = result[2];

      if (!this.versions.includes(from_version)) {
        this.versions.push(from_version);
      }
      if (!this.versionToVersions[from_version]) {
        this.versionToVersions[from_version] = [];
      }
      if (!this.versions.includes(to_version)) {
        this.versions.push(to_version);
      }
      if (!this.versionToVersions[to_version]) {
        this.versionToVersions[to_version] = [];
      }
      if (!this.versionToVersions[from_version].includes(to_version)) {
        this.versionToVersions[from_version].push(to_version);
      }
      this.migrationFilePaths[fileName] = filePath;
    });
  }

  calcGraph(): void {
    this.versions.forEach((version) => {
      this.versionsGraph.setNode(version);
      if (this.latestVersion < version) {
        this.latestVersion = version;
      }
    });
    Object.entries(this.versionToVersions).forEach(
      ([fromVersion, toVersions]) => {
        toVersions.forEach((toVersion) => {
          this.versionsGraph.setEdge(fromVersion, toVersion);
        });
      },
    );
  }

  calcShortestPaths(): void {
    const links = alg.dijkstraAll(this.versionsGraph);

    const getFileChain = (
      fromVersion: string,
      toVersion: string,
    ): Array<string> => {
      const link = links[fromVersion][toVersion];
      const { predecessor } = link;
      if (predecessor === fromVersion) {
        return [`${fromVersion}_to_${toVersion}.sql`];
      }
      return [
        ...getFileChain(fromVersion, predecessor),
        `${predecessor}_to_${toVersion}.sql`,
      ];
    };

    this.versions.forEach((fromVersion) => {
      this.versions.forEach((toVersion) => {
        if (fromVersion === toVersion) {
          return;
        }
        if (links[fromVersion][toVersion].distance === Infinity) {
          return;
        }
        const fileChain = getFileChain(fromVersion, toVersion);
        if (!this.paths[fromVersion]) {
          this.paths[fromVersion] = {};
        }
        this.paths[fromVersion][toVersion] = fileChain;
      });
    });
  }
}

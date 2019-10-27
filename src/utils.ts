import * as path from 'path';
import * as fs from 'fs';
import * as childProcess from 'child_process';
import { AuditLevel, PackageManager } from './types';

export function getPackageManagerName(
  packageManager: string,
  directory: string = './'
): PackageManager {
  switch (packageManager) {
    case 'npm':
      return 'npm';

    case 'yarn':
      return 'yarn';

    case 'auto': {
      function getPath(fileName: string): string {
        return path.resolve(directory, fileName);
      }

      const packageLockExists = fs.existsSync(getPath('package-lock.json'));
      if (packageLockExists) return 'npm';

      const shrinkwrapExists = fs.existsSync(getPath('npm-shrinkwrap.json'));
      if (shrinkwrapExists) return 'npm';

      const yarnLockExists = fs.existsSync(getPath('yarn.lock'));
      if (yarnLockExists) return 'yarn';

      throw Error(
        'Cannot establish package-manager type, missing package-lock.json or yarn.lock.'
      );
    }

    default:
      throw Error(`Unexpected package manager argument: ${packageManager}`);
  }
}

export function getYarnVersion() {
  return childProcess
    .execSync('yarn -v')
    .toString()
    .replace('\n', '');
}

export function getNpmVersion() {
  return childProcess
    .execSync('npm -v')
    .toString()
    .replace('\n', '');
}

export function mapAuditLevel(auditLevel: AuditLevel) {
  switch (auditLevel) {
    case 'info':
      return {
        info: true,
        low: true,
        moderate: true,
        high: true,
        critical: true
      };
    case 'low':
      return {
        info: false,
        low: true,
        moderate: true,
        high: true,
        critical: true
      };
    case 'moderate':
      return {
        info: false,
        low: false,
        moderate: true,
        high: true,
        critical: true
      };
    case 'high':
      return {
        info: false,
        low: false,
        moderate: false,
        high: true,
        critical: true
      };
    case 'critical':
      return {
        info: false,
        low: false,
        moderate: false,
        high: false,
        critical: true
      };
    default:
      throw new Error(`Invalid auditLevel: ${auditLevel}!`);
  }
}

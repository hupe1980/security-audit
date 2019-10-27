import Table from 'cli-table';
import chalk from 'chalk';

import { AuditAdvisory, AuditOptions } from './auditor';
import { mapAuditLevel } from './utils';
import { ParseResult } from './types';

export interface Reporter {
  parse: (
    advisories: AuditAdvisory[]
  ) => ParseResult;
}

export class CliReporter implements Reporter {
  constructor(private readonly options: AuditOptions) {}

  public parse(advisories: AuditAdvisory[]): ParseResult {
    let exitCode = 0;
    const output = [];

    const optionsTable = new Table();

    optionsTable.push(
      ['PackageManger', this.options.packageManager],
      ['Directory', this.options.directory],
      ['Registry', this.options.registry || 'Default'],
      ['AuditLevel', this.options.auditLevel],
      ['Whitelist [packages]', this.options.whitelist],
      ['Whitelist [advisories]', this.options.advisories]
    );

    output.push('The audit was conducted with the following options:');
    output.push(optionsTable.toString());
    output.push('\n');

    const auditLevelMap = mapAuditLevel(this.options.auditLevel);

    const vulnerabilities: string[] = [];

    advisories.forEach(advisory => {
      const {
        id,
        severity,
        title,
        module_name: moduleName,
        patched_versions: patchedVersions,
        url
      } = advisory;

      if (this.options.whitelist.includes(moduleName)) return;

      if (this.options.advisories.includes(id)) return;

      if (!auditLevelMap[severity]) return;

      const table = new Table();

      table.push(
        [chalk.red(severity), title],
        ['Id', id],
        ['Package', moduleName],
        ['Patched in', patchedVersions],
        ['More info', url]
      );

      vulnerabilities.push(table.toString());
    });

    if (vulnerabilities.length > 0) {
      exitCode = 1;
      output.push(chalk.red('The following vulnerabilities have been found:'));
      output.push(...vulnerabilities);
    } else {
      exitCode = 0;
      output.push(chalk.green('No vulnerabilities found!'));
    }
    
    return {
      output,
      exitCode
    };
  }
}

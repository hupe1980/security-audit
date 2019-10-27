import * as child_process from 'child_process';
import spawn from 'cross-spawn';
import chalk from 'chalk';

import { Reporter, CliReporter } from './reporter';
import { AuditLevel, PackageManager, ParseResult } from './types';

export interface AuditOptions {
  packageManager: PackageManager;
  whitelist: string[];
  advisories: number[];
  directory: string;
  registry?: string;
  maxAttempts: number;
  auditLevel: AuditLevel;
}

export interface AuditorProps {
  options: AuditOptions;
  reporter?: Reporter;
}

export interface AuditAdvisory {
  id: number;
  severity: AuditLevel;
  title: string;
  url: string;
  patched_versions: string;
  module_name: string;
}

export interface AuditSummary {
  dependencies: number;
  devDependencies: number;
  optionalDependencies: number;
  totalDependencies: number;
  vulnerabilities: {
    info: number;
    low: number;
    moderate: number;
    high: number;
    critical: number;
  };
}

export abstract class Auditor {
  protected readonly options: AuditOptions;
  protected readonly reporter: Reporter;

  constructor(props: AuditorProps) {
    this.options = props.options;
    this.reporter = props.reporter || new CliReporter(this.options);
  }

  protected abstract async audit(): Promise<ParseResult>;

  protected abstract isRetryErrorMessage(message: string): boolean;

  public async run(attempt: number = 0): Promise<any> {
    try {
      return await this.audit();
    } catch (error) {
      const message = error.message || error;

      if (
        this.isRetryErrorMessage(message) &&
        attempt <= this.options.maxAttempts
      ) {
        const newAttempt = attempt + 1;
        console.log(
          chalk.yellow(
            `The audit endpoint is temporarily unavailable! [Retry ${newAttempt}/${this.options.maxAttempts}]`
          )
        );
        return this.run(newAttempt);
      }

      throw error;
    }
  }

  protected async runProgram(
    command: string,
    args: ReadonlyArray<string>,
    options: child_process.SpawnOptions,
    stdoutListener: Function,
    stderrListener: Function
  ) {
    return new Promise(resolve => {
      const proc = spawn(command, args, options);

      if (proc.stdout) {
        proc.stdout.on('data', data => {
          stdoutListener(data);
        });
      }

      if (proc.stderr) {
        proc.stderr.on('data', data => {
          stderrListener(data);
        });
      }

      proc.on('close', () => resolve());
    });
  }
}

import * as semver from 'semver';

import { Auditor, AuditorProps, AuditAdvisory } from './auditor';
import { getNpmVersion } from './utils';
import { ParseResult } from './types';

const MINIMUM_NPM_VERSION = '6.0.0';

export class NpmAuditor extends Auditor {
  constructor(props: AuditorProps) {
    super(props);
    this.checkNpmVersion();
  }

  protected async audit(): Promise<ParseResult> {
    let stdoutBuffer = '';
    function outListener(data: string): void {
      stdoutBuffer = stdoutBuffer.concat(data);
    }

    const stderrBuffer: string[] = [];
    function errListener(line: string): void {
      stderrBuffer.push(line);
    }

    const args = ['audit', '--json'];

    if (this.options.registry) {
      args.push('--registry', this.options.registry);
    }

    const options = { cwd: this.options.directory };

    await super.runProgram('npm', args, options, outListener, errListener);

    if (stderrBuffer.length > 0) {
      throw new Error(
        `Invocation of npm audit failed:\n${stderrBuffer.join('\n')}`
      );
    }

    const data = JSON.parse(stdoutBuffer);
    const advisories: AuditAdvisory[] = Object.values(data.advisories);

    return this.reporter.parse(advisories);
  }

  protected isRetryErrorMessage(message: string): boolean {
    const retryErrorMessage = `does not support audit requests`;
    return message.includes(retryErrorMessage);
  }

  private checkNpmVersion(): void {
    const npmVersion = getNpmVersion();
    if (!semver.gte(npmVersion, MINIMUM_NPM_VERSION)) {
      throw new Error(
        `Npm ${npmVersion} not supported, must be >=${MINIMUM_NPM_VERSION}`
      );
    }
  }
}

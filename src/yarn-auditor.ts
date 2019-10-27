import * as semver from 'semver';

import { Auditor, AuditorProps, AuditAdvisory } from './auditor';
import { getYarnVersion } from './utils';
import { ParseResult } from './types';

const MINIMUM_YARN_VERSION = '1.12.3';

export class YarnAuditor extends Auditor {
  constructor(props: AuditorProps) {
    super(props);
    this.checkYarnVersion();
  }

  protected async audit(): Promise<ParseResult> {
    let advisories: AuditAdvisory[] = [];

    function outListener(line: any) {
      const { type, data } = JSON.parse(line);

      if (type === 'auditAdvisory') {
        advisories.push(data.advisory);
      }
    }

    function errListener(line: any) {
      if (line.type === 'error') {
        throw new Error(`Invocation of yarn audit failed:\n${line.data}`);
      }
    }

    const args = ['audit', '--json'];

    if (this.options.registry) {
      args.push('--registry', this.options.registry);
    }

    const options = { cwd: this.options.directory };

    await super.runProgram('yarn', args, options, outListener, errListener);

    return this.reporter.parse(advisories);
  }

  protected isRetryErrorMessage(message: string): boolean {
    const retryErrorMessage = `503 Service Unavailable`;
    return message.includes(retryErrorMessage);
  }

  private checkYarnVersion(): void {
    const yarnVersion = getYarnVersion();
    if (!semver.gte(yarnVersion, MINIMUM_YARN_VERSION)) {
      throw new Error(
        `Yarn ${yarnVersion} not supported, must be >=${MINIMUM_YARN_VERSION}`
      );
    }
  }
}

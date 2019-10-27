import * as yargs from 'yargs';
import chalk from 'chalk';
import figlet from 'figlet';

import { NpmAuditor } from './npm-auditor';
import { YarnAuditor } from './yarn-auditor';
import { getPackageManagerName } from './utils';
import { AuditLevel, ParseResult } from './types';

console.log(
  chalk.red(figlet.textSync('security-audit', { horizontalLayout: 'full' })),
  '\n'
);

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version } = require('../package.json');

const auditLevels: ReadonlyArray<AuditLevel> = [
  'info',
  'low',
  'moderate',
  'high',
  'critical'
];

const { argv } = yargs
  .version(version)
  .scriptName('security-audit')
  .help('help')
  .config('config')
  .options({
    p: {
      alias: 'package-manager',
      default: 'auto',
      describe: 'Choose a package manager',
      choices: ['auto', 'npm', 'yarn']
    },
    a: {
      alias: 'advisories',
      default: [],
      describe: 'Whitelisted advisory ids',
      type: 'array'
    },
    w: {
      alias: 'whitelist',
      default: [],
      describe: 'Whitelisted package names',
      type: 'array'
    },
    l: {
      alias: 'audit-level',
      default: 'low',
      describe:
        'Fail an audit only if the results include a vulnerability with the given level or higher',
      choices: auditLevels
    },
    d: {
      alias: 'directory',
      default: './',
      describe: 'The directory containing the package.json to audit',
      type: 'string'
    },
    registry: {
      default: undefined,
      describe: 'The registry to resolve packages by name and version',
      type: 'string'
    },
    'max-attempts': {
      default: 5,
      describe:
        'The max number of attempts to call an unavailable registry before failing',
      type: 'number'
    }
  });

const pm = getPackageManagerName(argv.p, argv.d);

const options = {
  packageManager: pm,
  directory: argv.d,
  whitelist: argv.w,
  advisories: argv.a,
  registry: argv.registry,
  auditLevel: argv.l as AuditLevel,
  maxAttempts: argv['max-attempts']
};

const auditor =
  pm === 'npm' ? new NpmAuditor({ options }) : new YarnAuditor({ options });

auditor
  .run()
  .then((result: ParseResult) => {
    const { exitCode, output } = result;
    
    console.log(output.join('\n'));

    if (exitCode === 0) {
      console.log('\n');
      console.log('✅', chalk.green(`Passed ${pm} security audit.`), '✅');
      console.log('\n');
    } else {
      console.log('\n');
      console.log('❌', chalk.red(`Failed ${pm} security audit.`), '❌');
      console.log('\n');
    }

    process.exitCode = exitCode;
  })
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  });

export type AuditLevel = 'info' | 'low' | 'moderate' | 'high' | 'critical';

export type PackageManager = 'npm' | 'yarn';

export type ParseResult = {
  exitCode: number;
  output: string[];
};

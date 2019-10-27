# security-audit
> Audits npm and yarn projects

## Installation

```bash
npm install security-audit
```

## How to use

```bash
npx security-audit
```

## Options

| Args | Alias             | Description                                                                                           |
| ---- | ----------------- | ----------------------------------------------------------------------------------------------------- |
| -p   | --package-manager             | Choose a package manager [`auto`, `npm`, `yarn`] (default `auto`)
| -a   | --advisories             | Whitelisted advisory ids (default `[]`)
| -w   | --whitelist             | Whitelisted package names (default `[]`)
| -l   | --audit-level             | Fail an audit only if the results include a vulnerability with the given level or higher [`info`, `low`, `moderate`, `high`, `critical`] (default `low`)  
| -d   | --directory             | The directory containing the package.json to audit (default `./`)                           |
| | --registry | The registry to resolve packages by name and version|
| | --max-attempts | The max number of attempts to call an unavailable registry before failing (default `5`)|

## License

[MIT](LICENSE)
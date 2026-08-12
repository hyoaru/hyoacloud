# Personal AWS Cloud Infrastructure

Personal AWS cloud platform, provisioned with [AWS CDK](https://aws.amazon.com/cdk/) (TypeScript).

## What this provisions

### Landing Zone

![Landing Zone Architecture](docs/assets/Landing%20Zone%20Architecture%20Diagram.png)

## Environment variables

Copy `.env.example` to `.env` and fill in all values:

| Variable                       | Purpose                                |
| ------------------------------ | -------------------------------------- |
| `LOG_ARCHIVE_ACCOUNT_EMAIL`    | Email for the `Log Archive` account.   |
| `SECURITY_ACCOUNT_EMAIL`       | Email for the `Security` account.      |
| `TOOLING_ACCOUNT_EMAIL`        | Email for the `Tooling` account.       |
| `PRODUCTION_ACCOUNT_EMAIL`     | Email for the `Production` account.    |
| `STAGING_ACCOUNT_EMAIL`        | Email for the `Staging` account.       |
| `IDENTITY_CENTER_INSTANCE_ARN` | IAM Identity Center instance ARN.      |
| `IDENTITY_STORE_ID`            | IAM Identity Center identity store ID. |

Management account and region come from your AWS CLI config (`CDK_DEFAULT_ACCOUNT` / `CDK_DEFAULT_REGION`). To change the allowed region, edit the `RestrictRegion` SCP in `lib/stacks/landing-zone.ts`.

## Deploy

```bash
cp .env.example .env
cdk bootstrap
cdk diff
cdk deploy
```


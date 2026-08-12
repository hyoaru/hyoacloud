import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";
import { aws_organizations as organizations } from "aws-cdk-lib";

export class LandingZoneStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // AWS Organization
    const organization = new organizations.CfnOrganization(
      this,
      "Organization",
      { featureSet: "ALL" },
    );
    organization.applyRemovalPolicy(cdk.RemovalPolicy.RETAIN);

    // Organizational Units
    const coreOu = new organizations.CfnOrganizationalUnit(this, "CoreOu", {
      name: "Core",
      parentId: organization.attrRootId,
    });
    coreOu.applyRemovalPolicy(cdk.RemovalPolicy.RETAIN);

    const workloadOu = new organizations.CfnOrganizationalUnit(
      this,
      "WorkloadOu",
      { name: "Workload", parentId: organization.attrRootId },
    );
    workloadOu.applyRemovalPolicy(cdk.RemovalPolicy.RETAIN);

    // Accounts
    const logArchiveAccount = new organizations.CfnAccount(
      this,
      "LogArchiveCoreAccount",
      {
        accountName: "Log Archive",
        email: process.env.LOG_ARCHIVE_ACCOUNT_EMAIL!,
        parentIds: [coreOu.ref],
      },
    );
    logArchiveAccount.applyRemovalPolicy(cdk.RemovalPolicy.RETAIN);

    const securityAccount = new organizations.CfnAccount(
      this,
      "SecurityCoreAccount",
      {
        accountName: "Security",
        email: process.env.SECURITY_ACCOUNT_EMAIL!,
        parentIds: [coreOu.ref],
      },
    );
    securityAccount.applyRemovalPolicy(cdk.RemovalPolicy.RETAIN);

    const toolingAccount = new organizations.CfnAccount(
      this,
      "ToolingCoreAccount",
      {
        accountName: "Tooling",
        email: process.env.TOOLING_ACCOUNT_EMAIL!,
        parentIds: [coreOu.ref],
      },
    );
    toolingAccount.applyRemovalPolicy(cdk.RemovalPolicy.RETAIN);

    const productionAccount = new organizations.CfnAccount(
      this,
      "ProductionWorkloadAccount",
      {
        accountName: "Production",
        email: process.env.PRODUCTION_ACCOUNT_EMAIL!,
        parentIds: [workloadOu.ref],
      },
    );
    productionAccount.applyRemovalPolicy(cdk.RemovalPolicy.RETAIN);

    const stagingAccount = new organizations.CfnAccount(
      this,
      "StagingWorkloadAccount",
      {
        accountName: "Staging",
        email: process.env.STAGING_ACCOUNT_EMAIL!,
        parentIds: [workloadOu.ref],
      },
    );
    stagingAccount.applyRemovalPolicy(cdk.RemovalPolicy.RETAIN);
  }
}

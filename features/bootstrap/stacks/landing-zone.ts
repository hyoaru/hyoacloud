import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";
import {
  aws_sso as sso,
  aws_organizations as organizations,
  aws_identitystore as identitystore,
} from "aws-cdk-lib";

export class LandingZoneStack extends cdk.Stack {
  public readonly organization: organizations.CfnOrganization;
  public readonly logArchiveAccount: organizations.CfnAccount;
  public readonly securityAccount: organizations.CfnAccount;
  public readonly toolingAccount: organizations.CfnAccount;
  public readonly stagingAccount: organizations.CfnAccount;
  public readonly productionAccount: organizations.CfnAccount;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // AWS Organization
    this.organization = new organizations.CfnOrganization(
      this,
      "Organization",
      {
        featureSet: "ALL",
      },
    );
    this.organization.applyRemovalPolicy(cdk.RemovalPolicy.RETAIN);

    // Organizational Units
    const coreOu = new organizations.CfnOrganizationalUnit(this, "CoreOu", {
      name: "Core",
      parentId: this.organization.attrRootId,
    });
    coreOu.applyRemovalPolicy(cdk.RemovalPolicy.RETAIN);

    const workloadOu = new organizations.CfnOrganizationalUnit(
      this,
      "WorkloadOu",
      {
        name: "Workload",
        parentId: this.organization.attrRootId,
      },
    );
    workloadOu.applyRemovalPolicy(cdk.RemovalPolicy.RETAIN);

    // Accounts
    this.logArchiveAccount = new organizations.CfnAccount(
      this,
      "LogArchiveCoreAccount",
      {
        accountName: "Log Archive",
        email: process.env.LOG_ARCHIVE_ACCOUNT_EMAIL!,
        parentIds: [coreOu.ref],
      },
    );
    this.logArchiveAccount.applyRemovalPolicy(cdk.RemovalPolicy.RETAIN);

    this.securityAccount = new organizations.CfnAccount(
      this,
      "SecurityCoreAccount",
      {
        accountName: "Security",
        email: process.env.SECURITY_ACCOUNT_EMAIL!,
        parentIds: [coreOu.ref],
      },
    );
    this.securityAccount.applyRemovalPolicy(cdk.RemovalPolicy.RETAIN);

    this.toolingAccount = new organizations.CfnAccount(
      this,
      "ToolingCoreAccount",
      {
        accountName: "Tooling",
        email: process.env.TOOLING_ACCOUNT_EMAIL!,
        parentIds: [coreOu.ref],
      },
    );
    this.toolingAccount.applyRemovalPolicy(cdk.RemovalPolicy.RETAIN);

    this.productionAccount = new organizations.CfnAccount(
      this,
      "ProductionWorkloadAccount",
      {
        accountName: "Production",
        email: process.env.PRODUCTION_ACCOUNT_EMAIL!,
        parentIds: [workloadOu.ref],
      },
    );
    this.productionAccount.applyRemovalPolicy(cdk.RemovalPolicy.RETAIN);

    this.stagingAccount = new organizations.CfnAccount(
      this,
      "StagingWorkloadAccount",
      {
        accountName: "Staging",
        email: process.env.STAGING_ACCOUNT_EMAIL!,
        parentIds: [workloadOu.ref],
      },
    );
    this.stagingAccount.applyRemovalPolicy(cdk.RemovalPolicy.RETAIN);

    // Service Control Policies
    new organizations.CfnPolicy(
      this,
      "OrganizationMemberTetherServiceControlPolicy",
      {
        name: "OrganizationMemberTether",
        description: "Prevents member accounts from leaving the organization",
        type: "SERVICE_CONTROL_POLICY",
        targetIds: [this.organization.attrRootId],
        content: {
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Deny",
              Action: "organizations:LeaveOrganization",
              Resource: "*",
            },
          ],
        },
      },
    );

    new organizations.CfnPolicy(this, "RestrictRegionServiceControlPolicy", {
      name: "RestrictRegion",
      description:
        "Denies all actions in any region except specified regions and required global services",
      type: "SERVICE_CONTROL_POLICY",
      targetIds: [coreOu.attrId, workloadOu.attrId],
      content: {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Deny",
            NotAction: [
              "iam:*",
              "account:*",
              "organizations:*",
              "route53:*",
              "budgets:*",
              "support:*",
              "cloudwatch:*",
              "ce:*",
              "pricingplanmanager:*",
              "cost-optimization-hub:*",
              "billing:*",
              "cloudfront:*",
              "shield:*",
              "wafv2:*",
              "globalaccelerator:*",
              "kms:*",
            ],
            Resource: "*",
            Condition: {
              StringNotEquals: {
                "aws:RequestedRegion": ["ap-southeast-1"],
              },
            },
          },
        ],
      },
    });

    // Identity Center
    const managementAdministratorsGroup = new identitystore.CfnGroup(
      this,
      "ManagementAdministratorsGroup",
      {
        identityStoreId: process.env.IDENTITY_STORE_ID!,
        displayName: "ManagementAdmnistrators",
        description: "Group for Management Administrators with full access",
      },
    );

    const managementAdministratorPermissionSet = new sso.CfnPermissionSet(
      this,
      "ManagementAdministratorPermissionSet",
      {
        name: "ManagementAdministratorAccess",
        description: "Full Administrative Access",
        instanceArn: process.env.IDENTITY_CENTER_INSTANCE_ARN!,
        managedPolicies: ["arn:aws:iam::aws:policy/AdministratorAccess"],
        sessionDuration: "PT1H",
      },
    );

    new sso.CfnAssignment(
      this,
      "ManagementAccountManagementAdministratorAssignment",
      {
        instanceArn: process.env.IDENTITY_CENTER_INSTANCE_ARN!,
        permissionSetArn:
          managementAdministratorPermissionSet.attrPermissionSetArn,
        principalType: "GROUP",
        principalId: managementAdministratorsGroup.attrGroupId,
        targetType: "AWS_ACCOUNT",
        targetId: this.organization.attrManagementAccountId,
      },
    );

    const platformAdministratorsGroup = new identitystore.CfnGroup(
      this,
      "PlatformAdministratorsGroup",
      {
        identityStoreId: process.env.IDENTITY_STORE_ID!,
        displayName: "PlatformAdministrators",
        description: "Group for Cloud Administrators with full access",
      },
    );

    const platformAdministratorPermissionSet = new sso.CfnPermissionSet(
      this,
      "PlatformAdministratorPermissionSet",
      {
        name: "PlatformAdministratorAccess",
        description: "Full Administrative Access",
        instanceArn: process.env.IDENTITY_CENTER_INSTANCE_ARN!,
        managedPolicies: ["arn:aws:iam::aws:policy/AdministratorAccess"],
        sessionDuration: "PT1H",
      },
    );

    new sso.CfnAssignment(
      this,
      "LogArchiveAccountPlatformAdministratorAssignment",
      {
        instanceArn: process.env.IDENTITY_CENTER_INSTANCE_ARN!,
        permissionSetArn:
          platformAdministratorPermissionSet.attrPermissionSetArn,
        principalType: "GROUP",
        principalId: platformAdministratorsGroup.attrGroupId,
        targetType: "AWS_ACCOUNT",
        targetId: this.logArchiveAccount.ref,
      },
    );

    new sso.CfnAssignment(
      this,
      "SecurityAccountPlatformAdministratorAssignment",
      {
        instanceArn: process.env.IDENTITY_CENTER_INSTANCE_ARN!,
        permissionSetArn:
          platformAdministratorPermissionSet.attrPermissionSetArn,
        principalType: "GROUP",
        principalId: platformAdministratorsGroup.attrGroupId,
        targetType: "AWS_ACCOUNT",
        targetId: this.securityAccount.ref,
      },
    );

    new sso.CfnAssignment(
      this,
      "ToolingAccountPlatformAdministratorAssignment",
      {
        instanceArn: process.env.IDENTITY_CENTER_INSTANCE_ARN!,
        permissionSetArn:
          platformAdministratorPermissionSet.attrPermissionSetArn,
        principalType: "GROUP",
        principalId: platformAdministratorsGroup.attrGroupId,
        targetType: "AWS_ACCOUNT",
        targetId: this.toolingAccount.ref,
      },
    );

    new sso.CfnAssignment(
      this,
      "ProductionAccountPlatformAdministratorAssignment",
      {
        instanceArn: process.env.IDENTITY_CENTER_INSTANCE_ARN!,
        permissionSetArn:
          platformAdministratorPermissionSet.attrPermissionSetArn,
        principalType: "GROUP",
        principalId: platformAdministratorsGroup.attrGroupId,
        targetType: "AWS_ACCOUNT",
        targetId: this.productionAccount.ref,
      },
    );

    new sso.CfnAssignment(
      this,
      "StagingAccountPlatformAdministratorAssignment",
      {
        instanceArn: process.env.IDENTITY_CENTER_INSTANCE_ARN!,
        permissionSetArn:
          platformAdministratorPermissionSet.attrPermissionSetArn,
        principalType: "GROUP",
        principalId: platformAdministratorsGroup.attrGroupId,
        targetType: "AWS_ACCOUNT",
        targetId: this.stagingAccount.ref,
      },
    );
  }
}

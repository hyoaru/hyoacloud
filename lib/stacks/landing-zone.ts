import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";
import * as organizations from "aws-cdk-lib/aws-organizations";

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
  }
}

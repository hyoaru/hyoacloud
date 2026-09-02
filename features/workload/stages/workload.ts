import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { IdentityStack } from "../stacks/identity";

export class WorkloadStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props?: cdk.StageProps) {
    super(scope, id, props);

    new IdentityStack(this, "Identity");
  }
}

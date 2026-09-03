import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";
import { aws_iam as iam } from "aws-cdk-lib";

export class IdentityStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const githubOidcProvider = new iam.OpenIdConnectProvider(
      this,
      "GithubOidcProvider",
      {
        url: "https://token.actions.githubusercontent.com",
        clientIds: ["sts.amazonaws.com"],
      },
    );

    new cdk.CfnOutput(this, "GithubOidcProviderArn", {
      value: githubOidcProvider.openIdConnectProviderArn,
      exportName: "GithubOidcProviderArn",
    });
  }
}

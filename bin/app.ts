#!/usr/bin/env node
import "dotenv/config";
import * as cdk from "aws-cdk-lib/core";
import { LandingZoneStack } from "../lib/stacks/landing-zone";

const app = new cdk.App();

new LandingZoneStack(app, "LandingZone", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

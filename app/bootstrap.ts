#!/usr/bin/env node
import * as cdk from "aws-cdk-lib/core";
import dotenv from "dotenv";
import { LandingZoneStack } from "../features/bootstrap/stacks";
dotenv.config({ path: ".env.bootstrap" });

const app = new cdk.App();

new LandingZoneStack(app, "LandingZone", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

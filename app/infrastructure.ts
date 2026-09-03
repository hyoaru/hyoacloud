#!/usr/bin/env node
import * as cdk from "aws-cdk-lib/core";
import dotenv from "dotenv";
import { WorkloadStage } from "../features/workload/stages";
dotenv.config({ path: ".env.infrastructure" });

const app = new cdk.App();

new WorkloadStage(app, "Staging", {
  env: {
    account: process.env.STAGING_ACCOUNT_ID,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

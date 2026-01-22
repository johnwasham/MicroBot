#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MicroBotPipelineStack } from '../lib/infra-pipeline-stack';
import { ServicePipelineStack } from '../lib/service-stack';

const app = new cdk.App();

new MicroBotPipelineStack(app, 'MicroBotPipelineStack', {
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION 
  }
});

new ServicePipelineStack(app, 'MicroBotServicePipelineStack', {
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION 
  }
});

app.synth();
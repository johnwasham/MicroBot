#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { VpcStack } from '../lib/vpc-stack'
import { MicroBotPipelineStack } from '../lib/micro_bot_pipeline-stack';

const app = new cdk.App();

new VpcStack(app, 'MicroBotVpcStack', {
  env: { account: '418052138440', region: 'us-west-1' },
});

new MicroBotPipelineStack(app, 'MicroBotPipelineStack', {
  env: { account: '418052138440', region: 'us-west-1' },
});

app.synth();
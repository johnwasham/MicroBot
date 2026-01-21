#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { VpcStack } from '../lib/vpc-stack'
import { MicroBotPipelineStack } from '../lib/micro_bot_pipeline-stack';
import { MicroBotFargateStack } from '../lib/micro_bot_fargate-stack';

const app = new cdk.App();

const vpcStack = new VpcStack(app, 'MicroBotVpcStack', {
  env: { account: '418052138440', region: 'us-west-1' },
});

new MicroBotFargateStack(app, 'MicroBotFargateStack', {
  env: { account: '418052138440', region: 'us-west-1' },
  vpc: vpcStack.vpc,
})

new MicroBotPipelineStack(app, 'MicroBotPipelineStack', {
  env: { account: '418052138440', region: 'us-west-1' },
});

app.synth();
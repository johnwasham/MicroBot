#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MicroBotPipelineStack } from '../lib/pipeline-stack';

const app = new cdk.App();

new MicroBotPipelineStack(app, 'MicroBotPipelineStack', {
  env: { account: '418052138440', region: 'us-west-1' }
});

app.synth();
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from "constructs";
import { MicroBotFargateStack } from './fargate-stack';

export interface MicroBotStageProps extends cdk.StackProps {
  vpc: ec2.Vpc
}

export class MicroBotStage extends cdk.Stage {
    constructor(scope: Construct, stageName: string, props: MicroBotStageProps) {
        super(scope, stageName, props);
  
        new MicroBotFargateStack(this, 'MicroBotStack', stageName, {});
    }
}
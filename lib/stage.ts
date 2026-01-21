import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from "constructs";
import { MicroBotFargateStack } from './fargate-stack';


export class MicroBotStage extends cdk.Stage {
    constructor(scope: Construct, stageName: string, props: cdk.StageProps) {
        super(scope, stageName, props);
  
        new MicroBotFargateStack(this, 'MicroBotStack', stageName, {});
    }
}
import * as cdk from 'aws-cdk-lib';
import { Construct } from "constructs";
import { MicroBotFargateStack } from './infra-fargate-stack';


export class MicroBotStage extends cdk.Stage {
    constructor(scope: Construct, stageName: string, props: cdk.StageProps) {
        super(scope, stageName, props);
  
        new MicroBotFargateStack(this, 'MicroBotStack', stageName, {});
    }
}
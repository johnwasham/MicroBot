import * as cdk from 'aws-cdk-lib'
import { Stack } from "aws-cdk-lib";
import { Construct } from "constructs";
import ec2 = require('aws-cdk-lib/aws-ec2');
import ecs = require('aws-cdk-lib/aws-ecs');
import ecs_patterns = require('aws-cdk-lib/aws-ecs-patterns');


export class MicroBotFargateStack extends Stack {
    constructor(scope: Construct, id: string, stageName: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const vpc = new ec2.Vpc(this, "MicroBotVpc", { maxAzs: 2 })

        const cluster = new ecs.Cluster(this, 'MicroBotCluster-' + stageName, { vpc })

        new ecs_patterns.ApplicationLoadBalancedFargateService(this, "FargateService-" + stageName, {
            cluster,
            taskImageOptions: {
                image: ecs.ContainerImage.fromRegistry("amazon/amazon-ecs-sample")
            }
        })
  }
}

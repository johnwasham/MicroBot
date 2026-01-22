import * as cdk from 'aws-cdk-lib'
import { Stack } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import ecs_patterns = require('aws-cdk-lib/aws-ecs-patterns');


export class MicroBotFargateStack extends Stack {
    constructor(scope: Construct, id: string, stageName: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const repository = new ecr.Repository(this, "MicroBotRepo", {
            repositoryName: "microbot",
            lifecycleRules: [
                {
                    maxImageCount: 10, // keep only the latest 10 images
                },
            ],
        });

        const vpc = new ec2.Vpc(this, 'MicroBotVpc', { maxAzs: 2 })

        const cluster = new ecs.Cluster(this, 'MicroBotCluster', { vpc })

        new ecs_patterns.ApplicationLoadBalancedFargateService(this, 'FargateService', {
            cluster,
            taskImageOptions: {
                image: ecs.ContainerImage.fromRegistry("amazon/amazon-ecs-sample")
            }
        })
  }
}

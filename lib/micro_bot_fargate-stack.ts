import ec2 = require('aws-cdk-lib/aws-ec2');
import ecs = require('aws-cdk-lib/aws-ecs');
import ecs_patterns = require('aws-cdk-lib/aws-ecs-patterns');
import cdk = require('aws-cdk-lib');

export interface MicroBotFargateProps extends cdk.StackProps {
    vpc: ec2.Vpc
}

export class MicroBotFargateStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: MicroBotFargateProps) {
    super(scope, id, props);

    const { vpc } = props

    const cluster = new ecs.Cluster(this, 'MicroBotCluster', { vpc })

    new ecs_patterns.ApplicationLoadBalancedFargateService(this, "FargateService", {
        cluster,
        taskImageOptions: {
            image: ecs.ContainerImage.fromRegistry("amazon/amazon-ecs-sample")
        }
    })
  }
}
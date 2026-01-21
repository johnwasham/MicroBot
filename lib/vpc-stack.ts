import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import { Ec2Action } from 'aws-cdk-lib/aws-cloudwatch-actions';
import { Vpc, IpAddresses, PrivateSubnet, PublicSubnet } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';


export class VpcStack extends cdk.Stack {
    public readonly vpc: ec2.Vpc

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        this.vpc = new Vpc(this, "MicroBotVpc", {
            maxAzs: 2,

            // cidr: '10.0.0.0/16',

            // // Subnet configuration – one public and one private per AZ
            // subnetConfiguration: [
            //     {
            //         cidrMask: 24,               // /24 for public subnets
            //         name: 'Public',
            //         subnetType: ec2.SubnetType.PUBLIC,
            //     },
            //     {
            //         cidrMask: 24,               // /24 for private subnets
            //         name: 'Private',
            //         subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS, // NAT enabled
            //     },
            // ],

            // enableDnsHostnames: true,
            // enableDnsSupport: true,
        })
    }
}
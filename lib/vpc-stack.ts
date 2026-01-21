import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import { Ec2Action } from 'aws-cdk-lib/aws-cloudwatch-actions';
import { Vpc, IpAddresses, PrivateSubnet, PublicSubnet } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';


export class VpcStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

        const vpc = new Vpc(this, "MicroBotVpc", {
            cidr: '10.0.0.0/16',

            // The number of Availability Zones to span
            maxAzs: 2,          // <-- change this if you want more AZs

            // Subnet configuration – one public and one private per AZ
            subnetConfiguration: [
                {
                    cidrMask: 24,               // /24 for public subnets
                    name: 'Public',
                    subnetType: ec2.SubnetType.PUBLIC,
                },
                {
                    cidrMask: 24,               // /24 for private subnets
                    name: 'Private',
                    subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS, // NAT enabled
                },
            ],

            // Optional: enable DNS support (default is true)
            enableDnsHostnames: true,
            enableDnsSupport: true,

            // maxAzs: 2,
            // ipAddresses: IpAddresses.cidr('10.0.0.0/16'),
            // natGateways: 1,
            // subnetConfiguration: [
            //     new PublicSubnet(this, 'PublicSubnet', {
            //         cidrBlock: '10.0.0.0/24'
            //     }),
            //     new PrivateSubnet(this, 'PrivateSubnet', {
            //         cidrBlock: '10.0.0.0/24'
            //     }),
            // ]
        })

    }
}
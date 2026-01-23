import * as cdk from 'aws-cdk-lib'
import { Stack } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as codepipeline from "aws-cdk-lib/aws-codepipeline";
import * as cp_actions from "aws-cdk-lib/aws-codepipeline-actions";
import ecs_patterns = require('aws-cdk-lib/aws-ecs-patterns');


export class MicroBotFargateStack extends Stack {
    constructor(scope: Construct, id: string, stageName: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const vpc = new ec2.Vpc(this, 'MicroBotVpc', { maxAzs: 2 })

        const repo = new ecr.Repository(this, "MicroBotRepo", {
            repositoryName: "microbot",
            lifecycleRules: [
                {
                    maxImageCount: 10, // keep only the latest 10 images
                },
            ],
        });

        const cluster = new ecs.Cluster(this, 'MicroBotCluster', { vpc });

        const fargateService = new ecs_patterns.ApplicationLoadBalancedFargateService(this, 'FargateService', {
            cluster,
            taskImageOptions: {
                image: ecs.ContainerImage.fromRegistry("amazon/amazon-ecs-sample")
            }
        })

        // =========================

        const sourceOutput = new codepipeline.Artifact("SourceArtifact");
        const buildOutput  = new codepipeline.Artifact("BuildArtifact");

        const sourceAction = new cp_actions.GitHubSourceAction({
            actionName: "GitHub_Source",
            owner: "johnwasham",
            repo: "MicroBotAPI",
            oauthToken: cdk.SecretValue.secretsManager("github-token"),
            output: sourceOutput,
            branch: "main",
        });

        // CodeBuild project to:
        // - build Docker image
        // - push to ECR
        // - emit imagedefinitions.json for ECS deploy action
        const project = new codebuild.PipelineProject(this, 'ServiceBuildProject', {
            environment: {
                privileged: true, // required for docker build
                buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
            },
            environmentVariables: {
                REPOSITORY_URI: {
                value: repo.repositoryUri,
                },
                CONTAINER_NAME: {
                // Must match container name in the task definition
                value: 'app', // change as appropriate
                },
            },
            buildSpec: codebuild.BuildSpec.fromObject({
                version: '0.2',
                phases: {
                pre_build: {
                    commands: [
                    'aws --version',
                    'COMMIT_HASH=$(echo $CODEBUILD_RESOLVED_SOURCE_VERSION | cut -c 1-7)',
                    'IMAGE_TAG=${COMMIT_HASH:=latest}',
                    'echo "Logging in to Amazon ECR..."',
                    'aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $REPOSITORY_URI',
                    ],
                },
                build: {
                    commands: [
                    'echo "Building the Docker image..."',
                    'docker build -t $REPOSITORY_URI:latest .',
                    'docker tag $REPOSITORY_URI:latest $REPOSITORY_URI:$IMAGE_TAG',
                    ],
                },
                post_build: {
                    commands: [
                    'echo "Pushing the Docker image..."',
                    'docker push $REPOSITORY_URI:latest',
                    'docker push $REPOSITORY_URI:$IMAGE_TAG',
                    'printf \'[{"name":"%s","imageUri":"%s"}]\' "$CONTAINER_NAME" "$REPOSITORY_URI:$IMAGE_TAG" > imagedefinitions.json',
                    'echo "imagedefinitions.json created:"',
                    'cat imagedefinitions.json',
                    ],
                },
                },
                artifacts: {
                files: ['imagedefinitions.json'],
                },
            }),
        });

        // Permissions for CodeBuild to push to ECR
        repo.grantPullPush(project.role!);
        project.addToRolePolicy(
        new iam.PolicyStatement({
            actions: ['ecr:GetAuthorizationToken'],
            resources: ['*'],
        }),
        );

        const buildAction = new cp_actions.CodeBuildAction({
            actionName: 'BuildAndPushImage',
            project,
            input: sourceOutput,
            outputs: [buildOutput],
        });

        // ECS deploy action: updates task definition of the service with new image from imagedefinitions.json
        const deployAction = new cp_actions.EcsDeployAction({
            actionName: 'DeployToFargate',
            service: fargateService.service,
            input: buildOutput, // contains imagedefinitions.json
        });

        // Pipeline
        new codepipeline.Pipeline(this, 'ServiceCodePipeline', {
            pipelineName: 'ServiceCodeToFargatePipeline',
            stages: [
                {
                    stageName: 'Source',
                    actions: [sourceAction],
                },
                {
                    stageName: 'Build',
                    actions: [buildAction],
                },
                {
                    stageName: 'Deploy',
                    actions: [deployAction],
                },
            ],
        });
    }
}

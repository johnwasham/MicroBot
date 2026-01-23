import * as cdk from 'aws-cdk-lib'
import { Stack } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
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
                image: ecs.ContainerImage.fromRegistry("microbot") // amazon/amazon-ecs-sample
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

        // Build action – runs a CodeBuild project that builds & pushes to ECR
        const buildProject = new codebuild.PipelineProject(this, "Build", {
            environment: {
                computeType: codebuild.ComputeType.SMALL,
                buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2_4,
                privileged: true, // needed for Docker
            },
            buildSpec: codebuild.BuildSpec.fromObject({
                version: "0.2",
                phases: {
                pre_build: {
                    commands: [
                    "echo Logging in to Amazon ECR",
                    "$(aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin ${repo.repositoryUri.split('/')[0]})",
                    ],
                },
                build: {
                    commands: [
                    "echo Building the Docker image",
                    "docker build -t ${repo.repositoryUri}:$CODEBUILD_RESOLVED_SOURCE_VERSION .",
                    "docker tag ${repo.repositoryUri}:$CODEBUILD_RESOLVED_SOURCE_VERSION ${repo.repositoryUri}:latest",
                    ],
                },
                post_build: {
                    commands: [
                    "echo Pushing the Docker image",
                    "docker push ${repo.repositoryUri}:$CODEBUILD_RESOLVED_SOURCE_VERSION",
                    "docker push ${repo.repositoryUri}:latest",
                    ],
                },
                },
                artifacts: {
                files: [],
                },
            }),
        });

        const buildAction = new cp_actions.CodeBuildAction({
            actionName: "CodeBuild",
            project: buildProject,
            input: sourceOutput,
            outputs: [buildOutput],
        });

        // Deploy action – updates the task definition with the new image
        const deployAction = new cp_actions.EcsDeployAction({
            actionName: "ECS_Deploy",
            service: fargateService.service,
            imageFile: new codepipeline.ArtifactPath(buildOutput, `imagedefinitions.json`)
        });

        // Assemble the pipeline
        new codepipeline.Pipeline(this, "Pipeline", {
        stages: [
            { stageName: "Source", actions: [sourceAction] },
            { stageName: "Build",  actions: [buildAction] },
            { stageName: "Deploy", actions: [deployAction] },
        ],
        });

        /* ── 4. Permissions (so the pipeline can push to ECR) ───────────────────── */
        repo.grantPullPush(buildProject.role!);
    }
}

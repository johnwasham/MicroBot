import * as cdk from 'aws-cdk-lib';
import {
  aws_codepipeline as codepipeline,
  aws_codepipeline_actions as cpactions,
} from 'aws-cdk-lib';
import {
  // Repository,
  // BranchName,
  // PipelineSource,
  CodeBuildAction,
  // CodeBuildProject,
  // CodeBuildProject,
} from 'aws-cdk-lib/aws-codepipeline-actions';
import { PipelineProject } from 'aws-cdk-lib/aws-codebuild';

import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import { MicroBotFargateStack } from './fargate-stack';


export class MicroBotPipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    // const cdkSourceAction = new codepipeline_actions.GitHubSourceAction({
    //   actionName: 'GitHub_Source',
    //   owner:     'johnwasham',
    //   repo:      'MicroBot',
    //   branch:    'main',
    //   oauthToken: cdk.SecretValue.secretsManager('github-token'),
    //   output: cdkSourceOutput,
    // });

    // const serviceSourceAction = new codepipeline_actions.GitHubSourceAction({
    //   actionName: 'GitHub_Source',
    //   owner: 'johnwasham',
    //   repo:  'MicroBotAPI',
    //   oauthToken: cdk.SecretValue.secretsManager('github-token'),  // store token in Secrets Manager
    //   output: serviceSourceOutput,
    //   branch: 'main',
    // });

    const ecrRepo = new ecr.Repository(this, 'MicroBotRepo', {
      repositoryName: 'microbot',
      lifecycleRules: [
        {
          maxImageCount: 10, // keep only the latest 10 images
        },
      ]
    });

    // const vpc = new ec2.Vpc(this, 'Vpc', {
    //   maxAzs: 2,
    // });

    const pipeline = new codepipeline.Pipeline(this, 'Pipeline', {
      pipelineName: 'MicroBotService',
      restartExecutionOnUpdate: true,
    });

    const cdkSourceOutput = new codepipeline.Artifact('CdkSource');
    pipeline.addStage({
      stageName: 'Source',
      actions: [
        new cpactions.GitHubSourceAction({
          actionName: 'CDK-Repo',
          owner: 'johnwasham',
          repo: 'MicroBot',
          branch: 'main',
          oauthToken: cdk.SecretValue.secretsManager('github-token'),
          output: cdkSourceOutput,
        }),
      ],
    });

    /* 5.2 Build stage – build the CDK stack that will create the pipeline itself */
    const cdkBuildProject = new PipelineProject(this, 'CdkBuild', {
      environment: { buildImage: cdk.aws_codebuild.LinuxBuildImage.STANDARD_6_0 },
      buildSpec: cdk.aws_codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: { commands: ['npm ci'] },
          build: { commands: ['npx cdk synth --no-color'] },
        },
        artifacts: {
          files: ['cdk.out/**/*'],
        },
      }),
    });

    const cdkBuildOutput = new codepipeline.Artifact('CdkBuild');

    pipeline.addStage({
      stageName: 'CDK-Build',
      actions: [
        new CodeBuildAction({
          actionName: 'Synth',
          project: cdkBuildProject,
          input: cdkSourceOutput,
          outputs: [cdkBuildOutput],
        }),
      ],
    });

    const deployPipeline = new PipelineProject(this, 'DeployPipeline', {
      environment: { buildImage: cdk.aws_codebuild.LinuxBuildImage.STANDARD_6_0 },
      buildSpec: cdk.aws_codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: { commands: ['npm ci'] },
          build: { commands: ['npx cdk deploy MicroBotPipelineStack --require-approval never'] },
        },
      }),
    });

    pipeline.addStage({
      stageName: 'Mutate-Pipeline',
      actions: [
        new CodeBuildAction({
          actionName: 'Deploy',
          project: deployPipeline,
          input: cdkBuildOutput,
        }),
      ],
    });

    // pipeline.addStage({
    //   stageName: "Source",
    //   actions: [cdkSourceAction],
    // });

    // pipeline.addStage({
    //   stageName: 'Synth',
    //   actions: [synthAction],
    // });

    // pipeline.addStage({
    //   stageName: "Build",
    //   actions: [buildAction]
    // });

    // pipeline.addStage({
    //   stageName: 'Beta',
    //   actions: [betaDeployAction],
    // });
  }
}
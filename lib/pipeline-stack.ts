import * as cdk from 'aws-cdk-lib';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import { Construct } from 'constructs';
import { Artifact } from 'aws-cdk-lib/aws-codepipeline';
import { MicroBotStage } from './stage';


export class MicroBotPipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const cdkSourceOutput = new Artifact('SourceArtifact');
    const serviceSourceOutput = new Artifact('SourceArtifact');
    const synthOutput  = new Artifact('SynthArtifact');
    // const buildOutput  = new Artifact('BuildArtifact');

    const cdkSourceAction = new codepipeline_actions.GitHubSourceAction({
      actionName: 'GitHub_Source',
      owner:     'johnwasham',
      repo:      'MicroBot',
      branch:    'main',
      oauthToken: cdk.SecretValue.secretsManager('github-token'),
      output: cdkSourceOutput,
    });

    // const serviceSourceAction = new codepipeline_actions.GitHubSourceAction({
    //   actionName: 'GitHub_Source',
    //   owner: 'johnwasham',
    //   repo:  'MicroBotAPI',
    //   oauthToken: cdk.SecretValue.secretsManager('github-token'),  // store token in Secrets Manager
    //   output: serviceSourceOutput,
    //   branch: 'main',
    // });

    // const repository = new ecr.Repository(this, "MicroBotRepo", {
    //     repositoryName: "microbot",
    //     lifecycleRules: [
    //         {
    //             maxImageCount: 10, // keep only the latest 10 images
    //         },
    //     ],
    // });

    // const repoUri = repository.repositoryUri

    // const buildProject = new codebuild.PipelineProject(this, 'DockerBuild', {
    //   environment: {
    //     buildImage: codebuild.LinuxBuildImage.STANDARD_6_0, // has Docker
    //     privileged: true,
    //   },
    //   buildSpec: codebuild.BuildSpec.fromObject({
    //     version: '0.2',
    //     phases: {
    //       pre_build: {
    //         commands: [
    //           // Log in to ECR
    //           `$(aws ecr get-login-password --region ${cdk.Stack.of(this).region} | docker login --username AWS --password-stdin ${repoUri})`,
    //         ],
    //       },
    //       build: {
    //         commands: [
    //           // Build the image
    //           `docker build -t ${repoUri}:latest .`,
    //         ],
    //       },
    //       post_build: {
    //         commands: [
    //           // Push the image
    //           `docker push ${repoUri}:latest`,
    //         ],
    //       },
    //     },
    //   }),
    // });

    // const buildAction = new codepipeline_actions.CodeBuildAction({
    //   actionName: 'Docker_Build',
    //   project: buildProject,
    //   input: serviceSourceOutput,
    //   outputs: [buildOutput],
    // });

    // Synth

    const synthProject = new codebuild.PipelineProject(this, 'SynthProject', {
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: { commands: ['npm i -g npm@latest, npm ci'] },
          build:   { commands: ['npm run build', 'npx cdk synth'] },
        },
        artifacts: {
          files: ['**/*'],
          'base-directory': 'cdk.out', 
        },
      }),
    });

    const synthAction = new codepipeline_actions.CodeBuildAction({
      actionName: 'CDK_Synth',
      project:   synthProject,
      input:     cdkSourceOutput,
      outputs:   [synthOutput],
    });

    // Deployment

    // this runs and creates template
    // const betaStack = new MicroBotStage(this, 'Beta', {
    //   env: { account: process.env.CDK_DEFAULT_ACCOUNT,
    //          region : process.env.CDK_DEFAULT_REGION },
    // });

    // const betaDeployAction = new codepipeline_actions.CloudFormationCreateUpdateStackAction({
    //   actionName: 'Deploy_Beta',
    //   stackName:  'beta-MicroBotStack',
    //   templatePath: synthOutput.atPath('MicroBotStack.template.json'),
    //   adminPermissions: true,
    // });
    
    const pipeline = new codepipeline.Pipeline(this, 'Pipeline', {
      pipelineName: 'MicroBotService'
    });

    pipeline.addStage({
      stageName: "Source",
      actions: [cdkSourceAction],
    });

    pipeline.addStage({
      stageName: 'Synth',
      actions: [synthAction],
    });

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
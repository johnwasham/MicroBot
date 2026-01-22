// app-pipeline-stack.ts
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
} from 'aws-cdk-lib/pipelines';


export class ServicePipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // /* ----------------------------------------------------------
    //    1. Pipeline that builds the Docker image and pushes it to ECR
    // ---------------------------------------------------------- */
    // const pipeline = new CodePipeline(this, 'ServicePipeline', {
    //     pipelineName: `${cdk.Aws.STACK_NAME}-Service`,

    //     synth: new ShellStep('Synth', {
    //         input: CodePipelineSource.gitHub('johnwasham/MicroBotAPI', 'main'),
    //         commands: [
    //         // Install dependencies, build the app and synthesize
    //         'npm ci',
    //         'npm run build',        // optional, if you have a build script
    //         'npx cdk synth',
    //         ],
    //     }),
    // });

    // /* ----------------------------------------------------------
    //    2. Build step – Docker build & push
    // ---------------------------------------------------------- */
    // const build = new ShellStep('BuildAndPush', {
    //   input: src,
    //   commands: [
    //     /* Install dependencies & build the app (if needed) */
    //     'npm ci',
    //     // Build a Docker image that will be pushed to the ECR repo created by InfraPipeline
    //     `docker build -t ${this.node.tryGetContext('ecr_repo_uri')} .`,
    //     // Login to ECR (the CodeBuild role will have the right policy)
    //     'aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $(aws sts get-caller-identity --query Account --output text).dkr.ecr.$AWS_REGION.amazonaws.com',
    //     `docker push ${this.node.tryGetContext('ecr_repo_uri')}`,
    //   ],
    // });

    // pipeline.addStage(build);

    // /* ----------------------------------------------------------
    //    3. Optional – Deploy step that updates the Fargate service
    //       (the task definition image is already pointing to the repo)
    // ---------------------------------------------------------- */
    // // If you want an explicit deploy step that forces ECS to pull the new image:
    // const deploy = new ShellStep('DeployECS', {
    //   input: src,
    //   commands: [
    //     // Force ECS to pull the new image by updating a dummy tag
    //     'aws ecs update-service --cluster my-cluster-name --service my-fargate-service --force-new-deployment',
    //   ],
    // });

    // pipeline.addStage(deploy);
  }
}

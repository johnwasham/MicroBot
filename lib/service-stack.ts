import * as cdk from 'aws-cdk-lib';
// import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
// import {
//   CodePipeline,
//   CodePipelineSource,
//   ShellStep,
// } from 'aws-cdk-lib/pipelines';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';

export class ServicePipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // const repoUri = "418052138440.dkr.ecr.us-west-1.amazonaws.com/microbot"

    // const pipeline = new CodePipeline(this, 'ServicePipeline', {
    //     pipelineName: `MicroBot-Service`,
    //     synth: new ShellStep('Synth-PushToRepo', {
    //         input: CodePipelineSource.gitHub('johnwasham/MicroBotAPI', 'main'),
    //         commands: [
    //           /* Install dependencies & build the app (if needed) */

      // const gitHubSource = codebuild.Source.gitHub({
      //   owner: "johnwasham",
      //   repo: "MicroBotAPI",
      //   // webhook: true, // optional, default: true if `webhookfilteres` were provided, false otherwise
      //   // webhookFilters: [
      //   //   codebuild.FilterGroup.inEventOf(codebuild.EventAction.PUSH).andBranchIs('main'),
      //   // ], // optional, by default all pushes and pull requests will trigger a build
      // });

  }
}

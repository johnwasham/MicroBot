import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
// import * as codepipeline from '@aws-cdk/aws-codepipeline';
// import * as cpactions from '@aws-cdk/aws-codepipeline-actions';
import { MicroBotStage } from './stage';


export class MicroBotPipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'MicroBotService',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub('johnwasham/MicroBot', 'main'),
        commands: ['npm ci', 'npm run build', 'npx cdk synth']
      }),
    });

    // const appSourceOutput = new codepipeline.Artifact();
    // const appSourceAction = new cpactions.GitHubSourceAction({
    //   actionName: 'App_Source',
    //   owner: props.appRepoOwner,
    //   repo: props.appRepoName,
    //   branch: 'main',
    //   oauthToken: cdkSourceAction.oauthToken, // same PAT
    //   output: appSourceOutput,
    //   trigger: cpactions.GitHubTrigger.PUSH,
    // });

    pipeline.addStage(new MicroBotStage(this, "beta", {}));
  }
}
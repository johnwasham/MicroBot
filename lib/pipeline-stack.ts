import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
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

    // pipeline.addStage(new MicroBotStage(this, "beta", {
    //   vpc: props.vpc
    // }));
  }
}
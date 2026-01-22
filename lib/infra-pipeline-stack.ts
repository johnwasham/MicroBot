import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
} from 'aws-cdk-lib/pipelines';
import { MicroBotStage } from './infra-stage';


export class MicroBotPipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'MicroBot-Infra',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub('johnwasham/MicroBot', 'main'),
        commands: ['npm ci', 'npm run build', 'npx cdk synth']
      }),
    });

    const infraStage = pipeline.addStage(new MicroBotStage(this, 'Beta', {}));

    // Optional: expose outputs so other pipelines can consume them
    // infraStage.stackOutputs.forEach((value, key) => {
    //   new cdk.CfnOutput(this, `${key}Out`, { value });
    // });
  }
}
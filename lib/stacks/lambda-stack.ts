import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Repository } from 'aws-cdk-lib/aws-ecr';
import { IRole } from 'aws-cdk-lib/aws-iam';
import { Code, Function, IFunction, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';


export interface LambdaStackProps extends StackProps {
  // vpc: IVpc;
  readonly serviceRole: IRole;
}

export class LambdaStack extends Stack {
  public readonly lambdaFunction: IFunction;

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    // Create ECR repository
    const ecrRepository = new Repository(this, 'DeliveryServiceEcrRepoId', {
      repositoryName: 'DeliveryServiceEcrRepo',
    });
    ecrRepository.grantPull(props.serviceRole);

    // Define Lambda function using ECR image as code
    this.lambdaFunction = new Function(this, 'DeliveryServiceLambdaId', {
      runtime: Runtime.NODEJS_16_X,
      handler: 'index.handler',
      code: Code.fromEcrImage(ecrRepository, { tag: 'latest' }),
      role: props.serviceRole,
      environment: {
        Stage: 'alpha',
      },
      memorySize: 3000,
      timeout: Duration.minutes(15),
      description: 'Delivery Service Lambda',
      // vpc: props.vpc
    });
  }
}

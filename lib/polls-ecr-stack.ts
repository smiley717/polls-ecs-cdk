import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecr from 'aws-cdk-lib/aws-ecr';

export class PollsEcrStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		// Create an ECR repository
		const repository = new ecr.Repository(this, 'PollsEcrRepo', {
			repositoryName: 'polls-js-node-app'
		});

		// Export the ECR repository ARN
		new cdk.CfnOutput(this, 'PollsEcrRepoArn', {
			value: repository.repositoryArn,
			exportName: 'PollsEcrRepoArn',
		});
	}
}

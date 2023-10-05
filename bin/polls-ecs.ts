#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { PollsEcrStack } from '../lib/polls-ecr-stack';
import { PollsEcsStack } from '../lib/polls-ecs-stack';

const app = new cdk.App();
new PollsEcrStack(app, 'PollsEcrStack', {
	stackName: 'PollsEcrStack',
	env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});
new PollsEcsStack(app, 'PollsEcsStack', {
	stackName: 'PollsEcsStack',
	env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});
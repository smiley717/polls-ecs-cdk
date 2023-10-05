import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { ApplicationLoadBalancedFargateService } from 'aws-cdk-lib/aws-ecs-patterns';
import * as iam from 'aws-cdk-lib/aws-iam';

export class PollsEcsStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);
		const imageName = 'polls-js-node-app';
		const imageTag = 'latest';

		// Create a VPC
		const vpc = new ec2.Vpc(this, 'PollsVPC');

		// Create an ECS cluster
		const cluster = new ecs.Cluster(this, 'PollsCluster', {
			vpc,
		});

		// Import ECR repository ARN
		const pollsEcrRepoArn = cdk.Stack.of(this).formatArn({
			service: 'ecr',
			resource: 'repository',
			resourceName: 'polls-js-node-app',
		});

		// // Import ECR repository ARN
		// const pollsEcrRepoArn = Fn.importValue('PollsEcrRepoArn');

		// Get the repository object
		const pollsJsEcrRepository = ecr.Repository.fromRepositoryAttributes(this, 'PollsEcrRepo', {
			repositoryArn: pollsEcrRepoArn,
			repositoryName: 'polls-js-node-app'
		});

		// Get the image from the repository
		const pollsJsImage = ecs.ContainerImage.fromEcrRepository(pollsJsEcrRepository, `${imageTag}`);

		// Define baseline task properties
		const taskProps = {
			executionRole: new iam.Role(this, 'PollsEcsTaskRole', {
				assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
				managedPolicies: [
					iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy'),
				],
			}),
			memoryLimitMiB: 1048,
			containerDefinitions: [
				{
					pollsJsImage,
					name: 'polls-js-container',
				},
			],
		};

		// Create a Fargate task definition and add the container using the ECR image
		const fargateTaskDefinition = new ecs.FargateTaskDefinition(this, 'PollsTaskDefinition', taskProps);

		const pollsJsContainer = fargateTaskDefinition.addContainer('PollsContainer', {
			image: pollsJsImage,
			containerName: 'polls-js-container',
			memoryLimitMiB: 512,
		});

		pollsJsContainer.addPortMappings({
			containerPort: 3000,
			hostPort: 3000,
			protocol: ecs.Protocol.TCP,
		})

		// Create an ECS Fargate service
		const fargateService = new ApplicationLoadBalancedFargateService(this, 'PollsFargateService', {
			cluster: cluster,
			memoryLimitMiB: 4096,
			cpu: 2048,
			desiredCount: 2,
			taskDefinition: fargateTaskDefinition,
			minHealthyPercent: 100,
			maxHealthyPercent: 200,
			assignPublicIp: true, // Required for the ECS/Fargate to have ECR pull access
			listenerPort: 3000,
			publicLoadBalancer: true, // Allow public access to the Load Balancer
		});


		// Setup AutoScaling policy
		const scaling = fargateService.service.autoScaleTaskCount({ maxCapacity: 2 });
		scaling.scaleOnCpuUtilization('CpuScaling', {
			targetUtilizationPercent: 50,
			scaleInCooldown: cdk.Duration.seconds(60),
			scaleOutCooldown: cdk.Duration.seconds(60)
		});

		new cdk.CfnOutput(this, 'LoadBalancerDNS', { value: fargateService.loadBalancer.loadBalancerDnsName });
	}
}

# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Requirements

- Install AWS CDK if you haven't already:

```shell
npm install -g aws-cdk
```
- We need to deploy PollsEcrStack at first to push Docker image.
```shell
cdk deploy PollsEcrStack
```

## Push Docker Image

- Navigate to your Node.js project directory, where your Dockerfile is located.
- Log in to ECR: Run the command
  ```shell
  aws ecr get-login-password --region your-region | docker login --username AWS --password-stdin your_account_id.dkr.ecr.your-region.amazonaws.com.
  ```
  Replace `your-region` and `your_account_id` accordingly.
- Build the Docker image:
  ```shell
  docker build -t your-repository-name .
  ```
- Tag the Docker image:
  ```shell
  shelldocker tag your-repository-name:latest your_account_id.dkr.ecr.your-region.amazonaws.com/your-repository-name:latest
  ```
- Push the Docker image:
  ```shell
  docker push your_account_id.dkr.ecr.your-region.amazonaws.com/your-repository-name:latest
  ```

## Useful commands

* `yarn build`   compile typescript to js
* `yarn watch`   watch for changes and compile
* `yarn test`    perform the jest unit tests
* `cdk bootstrap`      set up a new CDK environment in a specific AWS account/region
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template

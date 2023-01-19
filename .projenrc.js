const { awscdk } = require('projen');
const { Stability } = require('projen/lib/cdk');
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'Asif Ali',
  description: 'CDK Construct to create resources for validating pull requests in codecommit',
  stability: Stability.EXPERIMENTAL,
  cdkVersion: '2.53.0',
  defaultReleaseBranch: 'main',
  name: 'pr_validation_codecommit',
  repositoryUrl: 'https://github.com/asif-ali-244/pr_validation_codecommit.git',
  keywords: [
    'CDK',
    'Code Commit',
    'Pull Requests',
    'PR Validation',
  ],
  // deps: [],                /* Runtime dependencies of this module. */
  description: 'AWS Construct to create resources for PR Validation and review',
  stability: '',
  devDeps: [
    '@types/aws-lambda',
    'aws-lambda',
    'aws-sdk',
  ], /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
//   excludeTypescript: ['src/code-commit-pr-validation/lambdas/**'],
});

project.eslint.overrides.push({
  files: [
    '*',
  ],
  rules: {
    'import/no-extraneous-dependencies': 'off',
  },
});
project.synth();
const { awscdk } = require('projen');
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'Asif Ali',
  authorAddress: 'asifrajar244@gmail.com',
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
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.synth();
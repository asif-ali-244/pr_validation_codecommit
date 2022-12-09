# Automated Code Review with Pull requests in AWS Code Commit

Pull request validation is a part of CI pipeline that will be run whenever the PR is submitted. As a best practice, it is recommended that we run validation tests before merging the PR to the branch. A pull request validation step can run unit tests, build, code coverage etc. This will ensure that the PRs do not break the build or introduce any other issue. If the PR validation passes, then the changes are ready to be safely merged into the main branch.

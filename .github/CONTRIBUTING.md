# Overview  
Typedoc Plugin Localization version accepts contributions, as long as they follow the guidelines explained below. When contributing you would have to follow these steps:

1. Fork the repository or make a branch (if you have the necessary rights)
2. Perform the changes in your fork/branch
3. Create a pull request with your changes and reference the issue you're working on

Your pull request will undergo a review and if approved will be merged. All checks for the pull request should pass before a pull request is merged.


# Workflow
When working on an issue for the Typedoc Plugin Localization repository, you need to be aware of and to follow a correct status workflow. We have created a number of status labels in order to communicate well what the current status of a single issue/pull request is. The statuses are as follows:

## Development - applicable to issues

### Statuses
1. `status: in-review` this is the initial status of an issue. If the label is not placed, go ahead and place it.
2. `status: in-development` this is the status once you start working on an issue. Assign the issue to yourself if it hasn't been assigned already and remove the previous status and assign it an in development status.
3. `status: by-design` this is the status of an issue that has been reviewed and has been determined that the current design of the feature is such that the issue describes the correct behavior as incorrect. Remove other statuses and place this status if you've reviewed the issue.
4. `status: not-to-fix` this is the status of issues that derive from our code, but have been decided to leave as is. This is done when fixes require general design and/or architecture changes and are very risky.
5. `status: already-fixed` this status indicates that the issue is already fixed in the source code. When setting this status assign the person that logged the issue so that he can verify the issue is fixed in the respective development branch. Remove other statuses and place this status if you've reviewed the issue.
6. `status: cannot-reproduce` this status indicates that you cannot reproduce the issue in the source code. A reason may be because the issue is already fixed. When setting this status assign the person that logged the issue so that he can respond with more details on how to reproduce it.
7. `status: not a bug` this is the status of an issue that you reviewed and concluded that it's not a bug. You should comment explaining the reasons why you think the issue is not a bug.
8. `status: resolved` this is the status of an issue that has been fixed and there are active pull requests related to it.

Example status workflows:

`status: in-review` => `status: in-development` => `status: resolved` (PR is created)

`status: in-review` => `status: by-design` (Issue can be closed)

`status: in-review` => `status: third-party-issue` (Issue can be closed)

`status: in-review` => `status: not-to-fix` (Issue can be closed)

## Testing - applicable to pull requests
1. `status: awaiting-test` this is the initial status of pull requests. If you're performing the pull request, please place this status on it. Pull requests are accepted if and only if all status checks pass, review is performed, and the pull request has been tested and contains `status: verified`.
2. `status: in-test` place this status once you pick up the pull request for testing.
3. `status: verified` place this status once you've tested the pull request, have verified that the issue is fixed, and have included all necessary automated tests for the issue.
4. `status: not-fixed` place this status once you've tested the pull request and you are still able to reproduce the issue it's attempting to fix. Then assign the developer back on the pull request.

Example status workflows:

`status: awaiting-test` => `status: in-test` => `status: verified` (PR can be merged if all prerequisites are met)

`status: awaiting-test` => `status: in-test` => `status: not-fixed` => `status: in-development` => `status: awaiting-test`

# Commit message conventions
When committing a message you need to follow this template convention:
`<type>(<scope>): <subject> <issue|optional>`

1. `<type>` - The type is the conventional type of the commit message. All possible choices you can find [here](https://github.com/pvdlg/conventional-commit-types#commit-types).
2. `<scope>` - The scope is the context on which you are worked on. It could be current directive, component etc. 
	If you are unable to determine your working context you can leave it as "(*)".
3. `<subject>` - The subject (first line of the Commit message) is the most critical. So be sure you have clear and easy understandable description about the commit.
	The limit of the subject is at least `15` characters.
4. `<issue>` - The issue is the refenrece of the github task you have. Be aware that you are able to link more than one issue. For instance `(#123 #456)`. 
	Also there is another important point, for `(fix, feat, test) types` you are obliged to add at least one issue reference.
5. The limits you have per line is `80` characters.
### example: "feat(checkbox): add ripple, indeterminate state, and label #123"

# New feature development
In order to contribute code to a new feature, you need to follow these guidelines.

1. Work on implementation in your fork
2. Follow a test-driven development process (TDD) to ensure full code coverage, or make sure that you include unit tests that cover all of the newly added code
3. Document all newly added public methods, inputs, outputs and properties.
4. Make sure all static code analysis and tests pass before opening a pull request
5. Reference the issue you've been working on in your commit message and pull request title/description.
6. Don't forget to make the necessary status updates, as described in the workflow section.


# Testing a PR
In order to test a pull request that is awaiting test, perform the following actions.

1. Checkout the master branch locally. *Depending on the PR target this can also be a version branch.*
2. Verify that the issue describes correctly the current behavior of the feature/control.
3. If you reproduce the issue, checkout the pull request locally.

  Replace the `<PULL_ID>` with the respective pull number in the following:
  ```bash
  git fetch typedoc-plugin-localization +refs/pull/<PULL_ID>/merge
  git checkout -qf FETCH_HEAD
  ```
4. Verify that the expected behavior is observed with the changes in the pull request.
5. Return the pull request in a not fixed state if you're still reproducing the issue.
6. Don't forget to make the necessary status updates, as described in the workflow section.

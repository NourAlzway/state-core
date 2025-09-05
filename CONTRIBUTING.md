# Contributing to acacus

We love your input! We want to make contributing to acacus as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

### Pull Requests

1. Fork the repo and create your branch from `master`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

### Development Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/NourAlzway/acacus.git
   cd acacus
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Run tests:**

   ```bash
   npm test
   ```

4. **Start development:**
   ```bash
   npm run dev
   ```

### Code Style

We use ESLint and Prettier to maintain code quality and consistency. The configuration is already set up, and you can run:

```bash
# Check linting
npm run lint

# Fix linting issues
npm run lint:fix

# Check formatting
npm run format:check

# Fix formatting
npm run format
```

### Commit Messages

We use [Conventional Commits](https://conventionalcommits.org/) for commit messages. This helps us automatically generate changelogs and version bumps.

Format: `type(scope): description`

Types:

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `build`: Changes that affect the build system or external dependencies
- `ci`: Changes to our CI configuration files and scripts
- `chore`: Other changes that don't modify src or test files

Examples:

- `feat(core): add new state management API`
- `fix(types): correct State interface definition`
- `docs: update README with new examples`

### Testing

We have comprehensive testing guidelines to ensure code quality and maintainability:

- **Write tests for any new functionality** - All new features should include tests
- **Follow our testing conventions** - See [docs/TESTING.md](./docs/TESTING.md) for detailed guidelines
- **Use AAA pattern** - Structure tests with Arrange, Act, Assert comments
- **Keep test files focused** - Maximum 300-400 lines per file, split by scope
- **Ensure all tests pass** before submitting a PR
- **Aim for high test coverage** on new code
- **Use descriptive test names** that explain expected behavior

Key testing practices:

- Use scope-based file naming: `component-name.scope.test.ts`
- Follow established mocking patterns for React hooks
- Test both happy path and error scenarios
- Keep tests readable with clear comments

For complete testing guidelines, patterns, and examples, see our **[docs/Testing Guide](./docs/TESTING.md)**

### Types and Documentation

- Use TypeScript types for all new code
- Document public APIs with JSDoc comments
- Update README.md if you change user-facing functionality

## Reporting Bugs

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/NourAlzway/acacus/issues/new/choose).

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## Feature Requests

We also use GitHub issues to track feature requests. You can [request a new feature](https://github.com/NourAlzway/acacus/issues/new/choose).

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Feel free to reach out by [opening an issue](https://github.com/NourAlzway/acacus/issues/new/choose) with the "question" label.

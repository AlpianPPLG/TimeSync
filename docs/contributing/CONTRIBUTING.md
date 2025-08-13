# Contributing to Attendance Management System

Thank you for considering contributing to the Attendance Management System! We appreciate your time and effort. Please take a moment to review this document to make the contribution process smooth for everyone involved.

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

1. **Check Existing Issues** - Before creating a new issue, please check if the bug has already been reported.
2. **Create an Issue** - If you're unable to find an open issue addressing the problem, [open a new one](https://github.com/your-username/attendance-system/issues/new/choose).
3. **Provide Details** - Include a clear title, description, and steps to reproduce the issue.
4. **Version Information** - Specify which version of the application you're using.

### Suggesting Enhancements

1. **Check Existing Suggestions** - Your idea might already be under discussion.
2. **Create a Feature Request** - Open an issue with a clear description of the enhancement.
3. **Explain the Benefits** - Describe how this feature would benefit users.
4. **Provide Examples** - Include examples of how the feature would work.

### Your First Code Contribution

1. **Set Up Your Development Environment**
   ```bash
   # Fork and clone the repository
   git clone https://github.com/your-username/attendance-system.git
   cd attendance-system
   
   # Install dependencies
   npm install
   
   # Set up environment variables
   cp .env.example .env.local
   # Edit .env.local with your configuration
   
   # Run the development server
   npm run dev
   ```

2. **Create a Branch**
   ```bash
   git checkout -b feature/amazing-feature
   # or
   git checkout -b bugfix/annoying-bug
   ```

3. **Make Your Changes**
   - Follow the [code style guidelines](#code-style).
   - Write tests for new features.
   - Update documentation as needed.

4. **Test Your Changes**
   ```bash
   # Run the test suite
   npm test
   
   # Check for TypeScript errors
   npm run type-check
   
   # Lint your code
   npm run lint
   ```

5. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   # or
   git commit -m "fix: resolve annoying bug"
   ```
   
   Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:
   - `feat`: A new feature
   - `fix`: A bug fix
   - `docs`: Documentation only changes
   - `style`: Changes that do not affect the meaning of the code
   - `refactor`: A code change that neither fixes a bug nor adds a feature
   - `perf`: A code change that improves performance
   - `test`: Adding missing tests or correcting existing tests
   - `chore`: Changes to the build process or auxiliary tools

6. **Push to Your Fork**
   ```bash
   git push origin your-branch-name
   ```

7. **Open a Pull Request**
   - Go to the [Pull Requests](https://github.com/your-username/attendance-system/pulls) page.
   - Click "New Pull Request" and select your branch.
   - Fill in the PR template with details about your changes.
   - Submit the PR and wait for review.

## Code Style

### JavaScript/TypeScript
- Use TypeScript for all new code.
- Follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript).
- Use ESLint and Prettier for code formatting.
- Write meaningful variable and function names.
- Add JSDoc comments for public APIs.

### Styling
- Use Tailwind CSS for styling.
- Follow the [Tailwind CSS best practices](https://tailwindcss.com/docs/optimizing-for-production).
- Use CSS modules for component-specific styles.

### Database
- Use Prisma for database access.
- Write migrations for schema changes.
- Add indexes for frequently queried fields.

## Project Structure

```
src/
├── app/                # App Router pages and layouts
├── components/         # Reusable UI components
│   ├── ui/            # Shadcn/ui components
│   └── shared/        # Custom shared components
├── lib/               # Utility functions and configurations
├── hooks/             # Custom React hooks
├── services/          # API services
├── store/             # State management
├── styles/            # Global styles and themes
└── types/             # TypeScript type definitions
```

## Testing

- Write unit tests with Jest and React Testing Library.
- Test user interactions with React Testing Library.
- Add integration tests for critical paths.
- Aim for at least 80% code coverage.

## Documentation

- Keep the documentation up to date.
- Add JSDoc comments for functions and components.
- Update the README.md for significant changes.
- Add examples for new features.

## Review Process

1. **Code Review** - A maintainer will review your PR.
2. **CI/CD Checks** - Ensure all tests pass.
3. **Approval** - A maintainer will approve the PR.
4. **Merge** - Your changes will be merged into the main branch.

## Community

- Join our [GitHub Discussions](https://github.com/your-username/attendance-system/discussions) to ask questions and share ideas.
- Follow us on [Twitter](https://twitter.com/your-handle) for updates.
- Check out our [roadmap](ROADMAP.md) to see what's planned.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

Thank you for your contribution! Your work helps make the Attendance Management System better for everyone.

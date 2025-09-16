# Adobe App Builder Enablement Project

A comprehensive 7-week hands-on course designed to teach solution consultants how to build applications using Adobe App Builder.

## 🚀 Quick Start

### For Contributors

1. **Read the project rules**: [`.cursor-rules`](./.cursor-rules) - Comprehensive project guidelines
2. **Follow development guidelines**: [`DEVELOPMENT_GUIDELINES.md`](./DEVELOPMENT_GUIDELINES.md) - Quick reference for contributors
3. **Review the course plan**: [`docs-internal/2025-03 - Adobe App Builder Enablement Project Plan.md`](./docs-internal/2025-03%20-%20Adobe%20App%20Builder%20Enablement%20Project%20Plan.md)

### For Participants

Each week builds upon the previous, following this progression:

-   **Week 1**: Introduction & Positioning
-   **Week 2**: Environment Setup & First App
-   **Week 3**: Working with Actions & UI
-   **Week 4**: Deploying & Using Storage
-   **Week 5**: Working with State & File Storage
-   **Week 6**: API Mesh Deep Dive
-   **Week 7**: Working with Adobe I/O Events

## 📋 Project Rules & Guidelines

This project uses a comprehensive rules system to maintain consistency and quality:

-   **[`.cursor/rules/`](./.cursor/rules/)**: Modular rule files for different aspects
    -   [`project-overview.mcd`](./.cursor/rules/project-overview.mcd): Project context and structure
    -   [`coding-standards.mcd`](./.cursor/rules/coding-standards.mcd): Code quality and patterns
    -   [`exercise-development.mcd`](./.cursor/rules/exercise-development.mcd): Exercise creation guidelines
    -   [`adobe-specific.mcd`](./.cursor/rules/adobe-specific.mcd): Adobe platform best practices
    -   [`git-workflow.mcd`](./.cursor/rules/git-workflow.mcd): Development process and Git standards
-   **[`DEVELOPMENT_GUIDELINES.md`](./DEVELOPMENT_GUIDELINES.md)**: Developer quick reference

## 🛠 Technology Stack

-   **Adobe App Builder**: Serverless platform for Adobe Experience Cloud extensions
-   **React 16.13.1**: Frontend framework
-   **Adobe React Spectrum**: Adobe's design system
-   **Node.js >=18**: Runtime environment
-   **Adobe I/O SDK**: Core integration library
-   **Jest**: Testing framework

## 📁 Project Structure

```
├── src/dx-excshell-1/          # Main application
│   ├── actions/                # Serverless functions
│   ├── web-src/               # React frontend
│   ├── test/                  # Unit tests
│   └── e2e/                   # End-to-end tests
├── docs-internal/             # Internal documentation
├── docs-pub/                  # Public documentation & assets
├── .cursor/rules/             # Cursor rules (modular .mcd files)
├── PRD.md                     # Product Requirements Document
├── PROJECT_MANAGEMENT.md      # Task tracking and project management
└── DEVELOPMENT_GUIDELINES.md  # Developer guidelines
```

## 🎯 Learning Objectives

By completing this course, participants will:

-   Understand Adobe App Builder's architecture and capabilities
-   Build serverless functions using Adobe Runtime
-   Create React UIs with Adobe Spectrum components
-   Implement data persistence with App Builder Storage
-   Develop event-driven applications with Adobe I/O Events
-   Integrate multiple data sources using API Mesh

## 🚦 Getting Started

### Prerequisites

-   Node.js >= 18
-   Adobe I/O CLI installed
-   Access to Adobe Developer Console
-   Git

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd adobe-app-builder-enablement

# Install dependencies
npm install

# Verify setup
npm run lint
npm test

# Start local development
aio app run
```

## 📚 Course Materials

Each week includes:

-   **Learning objectives**: Clear goals for the session
-   **Step-by-step instructions**: Detailed implementation guide
-   **Working code examples**: Complete, runnable code
-   **Troubleshooting guide**: Solutions for common issues
-   **Verification steps**: How to confirm success

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run end-to-end tests
npm run e2e

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## 🚀 Deployment

```bash
# Deploy to staging
aio app deploy --stage

# Deploy to production
aio app deploy --prod

# View logs
aio app logs
```

## 📖 Documentation

-   **Product Requirements**: [`PRD.md`](./PRD.md) - Complete project requirements and specifications
-   **Project Management**: [`PROJECT_MANAGEMENT.md`](./PROJECT_MANAGEMENT.md) - Task tracking and workflow
-   **Course Plan**: [`docs-internal/2025-03 - Adobe App Builder Enablement Project Plan.md`](./docs-internal/2025-03%20-%20Adobe%20App%20Builder%20Enablement%20Project%20Plan.md)
-   **Weekly Exercises**: Located in `docs-pub/Week*.md`
-   **Development Guidelines**: [`DEVELOPMENT_GUIDELINES.md`](./DEVELOPMENT_GUIDELINES.md)
-   **Project Rules**: [`.cursor/rules/`](./.cursor/rules/) - Modular rule system

## 🤝 Contributing

1. Read the [development guidelines](./DEVELOPMENT_GUIDELINES.md)
2. Follow the [project rules](./.cursor/rules/)
3. Review the [PRD](./PRD.md) and [project management](./PROJECT_MANAGEMENT.md) processes
4. Create feature branch: `git checkout -b week-N-feature-name`
5. Make changes with tests
6. Submit pull request

## 📞 Support

-   **Adobe App Builder Docs**: https://developer.adobe.com/app-builder/
-   **React Spectrum**: https://react-spectrum.adobe.com/
-   **Adobe I/O CLI**: https://github.com/adobe/aio-cli

## 📄 License

This project is for internal Adobe enablement purposes.

# Development Guidelines

## Quick Start for Contributors

This document provides essential guidelines for anyone contributing to the Adobe App Builder Enablement project. For comprehensive rules, see [`.cursor/rules/`](./.cursor/rules/).

## Language Standards

**All documentation and user-facing content must use British English:**

-   Spelling: colour, realise, optimise, centre, licence (noun), etc.
-   Grammar: British conventions for punctuation and phrasing
-   Code comments: British English for consistency
-   Exercise instructions: British English throughout
-   Error messages: British English in user-facing components

## Project Setup

### Prerequisites

-   Node.js >= 18
-   Adobe I/O CLI
-   Git
-   Code editor (Cursor recommended)

### Initial Setup

```bash
# Clone and install dependencies
git clone <repository-url>
cd adobe-app-builder-enablement
npm install

# Verify setup
npm run lint
npm test
```

## Development Workflow

### 1. Weekly Exercise Development

Each week follows a structured approach:

```bash
# Create feature branch for the week
git checkout -b week-N-exercise-name

# Develop incrementally
# - Start with action implementation
# - Add UI integration
# - Write tests
# - Update documentation

# Validate before committing
npm run lint
npm test
npm run e2e
```

### 2. Code Structure

#### Actions (Serverless Functions)

Location: `src/dx-excshell-1/actions/`

```javascript
// Template for new actions
const { Core } = require('@adobe/aio-sdk')

async function main(params) {
    const logger = Core.Logger('action-name', {
        level: params.LOG_LEVEL || 'info',
    })

    try {
        // Validate inputs
        const requiredParams = ['param1', 'param2']
        for (const param of requiredParams) {
            if (!params[param]) {
                return {
                    statusCode: 400,
                    body: { error: `Missing required parameter: ${param}` },
                }
            }
        }

        // Business logic here
        const result = await performOperation(params)

        logger.info('Action completed successfully')
        return {
            statusCode: 200,
            body: { result },
        }
    } catch (error) {
        logger.error('Action failed:', error)
        return {
            statusCode: 500,
            body: { error: 'Internal server error' },
        }
    }
}

exports.main = main
```

#### React Components

Location: `src/dx-excshell-1/web-src/src/components/`

```jsx
import React, { useState, useEffect } from 'react'
import {
    Provider,
    defaultTheme,
    View,
    Heading,
    ProgressCircle,
    IllustratedMessage,
} from '@adobe/react-spectrum'
import { NotFound } from '@spectrum-icons/illustrations'

function ExerciseComponent({ actionName }) {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const fetchData = async () => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch(
                `/api/v1/web/dx-excshell-1/${actionName}`
            )
            if (!response.ok) throw new Error('Failed to fetch data')

            const result = await response.json()
            setData(result)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    if (loading) {
        return (
            <View padding="size-200">
                <ProgressCircle aria-label="Loading data..." />
            </View>
        )
    }

    if (error) {
        return (
            <IllustratedMessage>
                <NotFound />
                <Heading>Error Loading Data</Heading>
                <p>{error}</p>
            </IllustratedMessage>
        )
    }

    return (
        <View padding="size-200">
            <Heading level={2}>Exercise Results</Heading>
            {/* Render your data here */}
        </View>
    )
}

export default ExerciseComponent
```

### 3. Testing Strategy

#### Unit Tests

```javascript
// src/dx-excshell-1/test/action-name.test.js
const { main } = require('../actions/action-name')

describe('Action Name', () => {
    test('should return success with valid parameters', async () => {
        const params = {
            requiredParam: 'test-value',
            LOG_LEVEL: 'debug',
        }

        const result = await main(params)

        expect(result.statusCode).toBe(200)
        expect(result.body.result).toBeDefined()
    })

    test('should return error with missing parameters', async () => {
        const params = {}

        const result = await main(params)

        expect(result.statusCode).toBe(400)
        expect(result.body.error).toContain('Missing required parameter')
    })
})
```

#### E2E Tests

```javascript
// src/dx-excshell-1/e2e/exercise.e2e.test.js
describe('Week N Exercise E2E', () => {
    test('complete user workflow', async () => {
        // Test the full user journey for the exercise
        // 1. Load the page
        // 2. Interact with UI elements
        // 3. Verify expected outcomes
    })
})
```

## Exercise Creation Guidelines

### Exercise Template

````markdown
# Week N: [Exercise Title]

## Learning Objectives

By the end of this exercise, participants will be able to:

-   [ ] Objective 1
-   [ ] Objective 2
-   [ ] Objective 3

## Prerequisites

-   Completed Week N-1 exercise
-   Adobe I/O access configured
-   Local development environment set up

## Exercise Overview

Brief description of what we're building and why it's important.

## Step-by-Step Instructions

### Step 1: [Action Description]

**Goal**: What we're trying to achieve

**Implementation**:

```javascript
// Code example with comments
```
````

**Verification**: How to confirm this step worked

### Step 2: [Next Action]

**Goal**: Next objective

**Implementation**:

```jsx
// React component code
```

**Verification**: Expected outcome

## Testing Your Implementation

```bash
# Commands to test the exercise
npm test
npm run e2e
```

## Troubleshooting

### Common Issue 1

**Problem**: Description of the issue
**Solution**: Step-by-step resolution
**Prevention**: How to avoid this issue

### Common Issue 2

**Problem**: Another common problem
**Solution**: How to fix it

## Next Steps

-   What this exercise enables
-   Preview of next week's content
-   Additional resources for deeper learning

## Resources

-   [Adobe App Builder Documentation](https://developer.adobe.com/app-builder/)
-   [React Spectrum Components](https://react-spectrum.adobe.com/)
-   [Adobe I/O Runtime](https://developer.adobe.com/runtime/)

```

## Quality Checklist

Before submitting any code or exercise:

### Code Quality
- [ ] ESLint passes (`npm run lint`)
- [ ] All tests pass (`npm test`)
- [ ] E2E tests pass (`npm run e2e`)
- [ ] No console errors in browser
- [ ] Proper error handling implemented
- [ ] Logging added for debugging

### Exercise Quality
- [ ] Learning objectives clearly stated
- [ ] Step-by-step instructions provided
- [ ] Code examples are complete and working
- [ ] Verification steps included
- [ ] Troubleshooting section added
- [ ] Screenshots included for UI changes
- [ ] Completable within 30 minutes

### Documentation
- [ ] README updated if needed
- [ ] Code comments added for complex logic
- [ ] JSDoc added for reusable functions
- [ ] Exercise documentation complete

## Git Workflow

### Commit Messages
Use conventional commit format:
```

feat(week-3): add user generation action
fix(week-2): resolve authentication issue
docs(week-4): update storage exercise instructions
test(week-5): add event handling tests

````

### Branch Naming
- `week-N-feature-name`: For exercise development
- `hotfix/issue-description`: For critical fixes
- `docs/update-description`: For documentation updates

### Pull Request Process
1. Create feature branch from `main`
2. Implement changes with tests
3. Update documentation
4. Submit PR with clear description
5. Address review feedback
6. Merge after approval

## Deployment

### Local Development
```bash
# Start local development server
aio app run

# Deploy to local Adobe Runtime
aio app deploy --local
````

### Staging Deployment

```bash
# Deploy to Adobe I/O staging
aio app deploy --stage

# Test deployed application
curl https://[namespace].adobeio-static.net/api/v1/web/dx-excshell-1/[action]
```

### Production Deployment

```bash
# Deploy to production
aio app deploy --prod

# Verify deployment
aio app logs
```

## Getting Help

### Resources

-   **Adobe App Builder Docs**: https://developer.adobe.com/app-builder/
-   **React Spectrum**: https://react-spectrum.adobe.com/
-   **Adobe I/O CLI**: https://github.com/adobe/aio-cli

### Common Commands

```bash
# Check Adobe CLI status
aio auth list

# View application logs
aio app logs

# Debug actions locally
aio app run --local

# Test specific action
aio runtime action invoke dx-excshell-1/action-name --param key value
```

### Support Channels

-   Internal team Slack channel
-   Adobe Developer Community
-   GitHub Issues for project-specific problems

---

Remember: This is an educational project. Prioritize clarity and learning outcomes in all implementations.

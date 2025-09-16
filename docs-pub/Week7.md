# Week 7: Working with Adobe I/O Events

**Goal:** Learn how to build **event-driven applications** using Adobe I/O Events to create reactive, scalable systems that respond automatically to user actions and system changes.

---

## Quick Navigation

-   [Introduction to Adobe I/O Events](#introduction-to-adobe-io-events)
-   [Step 1: Setting up Event Providers and Consumers](#step-1-setting-up-event-providers-and-consumers)
-   [Step 2: Publishing Events from Actions](#step-2-publishing-events-from-actions)
-   [Step 3: Creating Event Listeners](#step-3-creating-event-listeners)
-   [Step 4: Building Event-Driven Workflows](#step-4-building-event-driven-workflows)
-   [Step 5: Integrating Events with Storage](#step-5-integrating-events-with-storage)
-   [Completion Checklist](#completion-checklist)
-   [Course Summary](#course-summary)

---

## Introduction to Adobe I/O Events

Adobe I/O Events enables you to build **reactive applications** that respond to changes across Adobe's ecosystem and your custom applications.

### Key Concepts

| Concept                | Description                          | Example                            |
| ---------------------- | ------------------------------------ | ---------------------------------- |
| **Event Provider**     | System that publishes events         | Your App Builder action            |
| **Event Consumer**     | System that listens for events       | Another action that processes data |
| **Event Type**         | Category of event                    | `user.created`, `order.completed`  |
| **Webhook**            | HTTP endpoint that receives events   | Your action URL                    |
| **Event Registration** | Subscription to specific event types | Subscribe to `user.created` events |

### Why Use Events?

-   **Decoupling**: Systems don't need to know about each other
-   **Scalability**: Handle high volumes of interactions
-   **Reliability**: Built-in retry and error handling
-   **Real-time**: Immediate response to changes
-   **Auditability**: Complete event history

---

## Step 1: Setting up Event Providers and Consumers

First, let's configure your Adobe Developer Console project for events.

### 1. Add Events to Your Project

1. Go to your **Adobe Developer Console** project
2. Click **Add Service** → **Events**
3. Select **Custom Events** (for your own event types)
4. Click **Save configured API**

### 2. Install the Events SDK

```sh
npm install @adobe/aio-lib-events
```

### 3. Create Event Configuration

Create `events-config.json` in your project root:

```json
{
    "events": {
        "provider_id": "your_provider_id",
        "event_types": [
            {
                "label": "User Created",
                "event_code": "user.created",
                "description": "Triggered when a new user is generated"
            },
            {
                "label": "User Updated",
                "event_code": "user.updated",
                "description": "Triggered when user data is modified"
            },
            {
                "label": "Report Generated",
                "event_code": "report.generated",
                "description": "Triggered when a CSV report is created"
            }
        ]
    }
}
```

### 4. Verify Events Setup

Create a test action to verify events are working:

```sh
aio app add action
```

Name it `test-events` and replace the content:

```javascript
const { Core } = require('@adobe/aio-sdk')
const eventsSdk = require('@adobe/aio-lib-events')

async function main(params) {
    const logger = Core.Logger('test-events', {
        level: params.LOG_LEVEL || 'info',
    })

    try {
        // Initialize events client
        const eventsClient = await eventsSdk.init({
            orgId: params.ADOBE_ORG_ID,
            apiKey: params.ADOBE_API_KEY,
            accessToken: params.ADOBE_ACCESS_TOKEN,
        })

        logger.info('Events client initialized successfully')

        return {
            statusCode: 200,
            body: {
                message: 'Events setup is working!',
                timestamp: new Date().toISOString(),
            },
        }
    } catch (error) {
        logger.error('Events setup error:', error)
        return {
            statusCode: 500,
            body: { error: error.message },
        }
    }
}

exports.main = main
```

---

## Step 2: Publishing Events from Actions

Let's modify your existing `generate-user` action to publish events when users are created.

### 1. Create an Event Publisher Action

```sh
aio app add action
```

Name it `generate-user-with-events` and implement:

```javascript
const { Core } = require('@adobe/aio-sdk')
const { faker } = require('@faker-js/faker')
const { errorResponse } = require('../utils')
const eventsSdk = require('@adobe/aio-lib-events')

async function main(params) {
    const logger = Core.Logger('generate-user-with-events', {
        level: params.LOG_LEVEL || 'info',
    })

    try {
        // Generate user data
        const userData = {
            id: faker.string.uuid(),
            name: faker.person.fullName(),
            email: faker.internet.email(),
            phone: faker.phone.number({ style: 'international' }),
            address: {
                street: faker.location.streetAddress(),
                city: faker.location.city(),
                country: faker.location.country(),
            },
            createdAt: new Date().toISOString(),
        }

        logger.info('Generated user data:', userData)

        // Initialize events client
        const eventsClient = await eventsSdk.init({
            orgId:
                params.__ow_headers['x-gw-ims-org-id'] || params.ADOBE_ORG_ID,
            apiKey: params.__ow_headers['x-api-key'] || params.ADOBE_API_KEY,
            accessToken:
                params.__ow_headers['authorization']?.replace('Bearer ', '') ||
                params.ADOBE_ACCESS_TOKEN,
        })

        // Publish event
        const eventData = {
            event_id: faker.string.uuid(),
            event_type: 'user.created',
            source: 'app-builder-enablement',
            source_id: userData.id,
            data: {
                user: userData,
                metadata: {
                    version: '1.0',
                    source_action: 'generate-user-with-events',
                },
            },
            time: userData.createdAt,
        }

        await eventsClient.publishEvent(eventData)
        logger.info('Event published successfully:', eventData.event_id)

        return {
            statusCode: 200,
            body: {
                success: true,
                user: userData,
                event: {
                    id: eventData.event_id,
                    type: eventData.event_type,
                    published: true,
                },
            },
        }
    } catch (error) {
        logger.error('Error in generate-user-with-events:', error)
        return errorResponse(
            500,
            `Failed to generate user or publish event: ${error.message}`,
            logger
        )
    }
}

exports.main = main
```

### 2. Test Event Publishing

Use "Your App Actions" to test the `generate-user-with-events` action. Check the logs to see if events are being published.

---

## Step 3: Creating Event Listeners

Now let's create actions that listen for and respond to events.

### 1. Create a User Processing Action

```sh
aio app add action
```

Name it `process-user-event` and implement:

```javascript
const { Core } = require('@adobe/aio-sdk')
const { errorResponse } = require('../utils')
const stateLib = require('@adobe/aio-lib-state')

async function main(params) {
    const logger = Core.Logger('process-user-event', {
        level: params.LOG_LEVEL || 'info',
    })

    try {
        // This action will be triggered by an event
        const eventData = params.data || params

        logger.info('Received event:', eventData)

        // Validate event type
        if (eventData.event_type !== 'user.created') {
            return {
                statusCode: 200,
                body: {
                    message: 'Event type not handled',
                    event_type: eventData.event_type,
                },
            }
        }

        const user = eventData.data.user

        // Initialize state storage
        const state = await stateLib.init({ region: 'apac' })

        // Store user in different formats for different purposes
        await Promise.all([
            // Store the full user data
            state.put(`user:${user.id}`, user, { ttl: 3600 }), // 1 hour TTL

            // Store in a searchable index
            state.put(`users:by-email:${user.email}`, user.id, { ttl: 3600 }),

            // Update user count
            state.get('stats:user-count').then(async (count) => {
                const newCount = (count || 0) + 1
                await state.put('stats:user-count', newCount)
                return newCount
            }),

            // Store recent users list (last 10)
            state.get('users:recent').then(async (recent) => {
                const recentUsers = recent || []
                recentUsers.unshift({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    createdAt: user.createdAt,
                })

                // Keep only the last 10
                if (recentUsers.length > 10) {
                    recentUsers.length = 10
                }

                await state.put('users:recent', recentUsers, { ttl: 7200 }) // 2 hours
            }),
        ])

        // Perform additional processing
        const processingResult = {
            userId: user.id,
            processed: true,
            processingTime: new Date().toISOString(),
            actions: [
                'stored_user_data',
                'indexed_by_email',
                'updated_user_count',
                'added_to_recent_list',
            ],
        }

        logger.info('User processing completed:', processingResult)

        return {
            statusCode: 200,
            body: {
                success: true,
                event_id: eventData.event_id,
                processing: processingResult,
            },
        }
    } catch (error) {
        logger.error('Error processing user event:', error)
        return errorResponse(
            500,
            `Failed to process user event: ${error.message}`,
            logger
        )
    }
}

exports.main = main
```

### 2. Create an Event Webhook Registration

For events to trigger your actions, you need to register webhooks. Create `register-webhooks` action:

```javascript
const { Core } = require('@adobe/aio-sdk')
const eventsSdk = require('@adobe/aio-lib-events')

async function main(params) {
    const logger = Core.Logger('register-webhooks', {
        level: params.LOG_LEVEL || 'info',
    })

    try {
        const eventsClient = await eventsSdk.init({
            orgId:
                params.__ow_headers['x-gw-ims-org-id'] || params.ADOBE_ORG_ID,
            apiKey: params.__ow_headers['x-api-key'] || params.ADOBE_API_KEY,
            accessToken:
                params.__ow_headers['authorization']?.replace('Bearer ', '') ||
                params.ADOBE_ACCESS_TOKEN,
        })

        // Register webhook for user.created events
        const webhook = await eventsClient.createWebhook({
            name: 'user-created-processor',
            description: 'Processes user.created events',
            webhook_url: params.PROCESS_USER_ACTION_URL, // URL of your process-user-event action
            events_of_interest: [
                {
                    event_code: 'user.created',
                    provider_id: params.PROVIDER_ID,
                },
            ],
        })

        logger.info('Webhook registered:', webhook)

        return {
            statusCode: 200,
            body: {
                success: true,
                webhook: webhook,
                message: 'Event listener registered successfully',
            },
        }
    } catch (error) {
        logger.error('Error registering webhook:', error)
        return {
            statusCode: 500,
            body: { error: error.message },
        }
    }
}

exports.main = main
```

---

## Step 4: Building Event-Driven Workflows

Let's create a complete workflow that demonstrates the power of event-driven architecture.

### 1. Create a Report Generation Event

```sh
aio app add action
```

Name it `generate-report-with-events` and implement:

```javascript
const { Core } = require('@adobe/aio-sdk')
const files = require('@adobe/aio-lib-files')
const { Parser } = require('json2csv')
const { faker } = require('@faker-js/faker')
const eventsSdk = require('@adobe/aio-lib-events')
const { errorResponse } = require('../utils')

async function main(params) {
    const logger = Core.Logger('generate-report-with-events', {
        level: params.LOG_LEVEL || 'info',
    })

    try {
        const reportId = faker.string.uuid()
        const rows = parseInt(params.rows) || 20

        // Generate report data
        const reportData = Array.from({ length: rows }, () => ({
            id: faker.string.uuid(),
            name: faker.person.fullName(),
            email: faker.internet.email(),
            phone: faker.phone.number({ style: 'international' }),
            company: faker.company.name(),
            department: faker.commerce.department(),
            job_title: faker.person.jobTitle(),
            created_at: faker.date.recent().toISOString(),
        }))

        // Generate CSV
        const parser = new Parser()
        const csv = parser.parse(reportData)

        // Save to file storage
        const f = await files.init()
        const filename = `reports/user-report-${reportId}.csv`
        await f.write(filename, csv)

        const fileProperties = await f.getProperties(filename)
        const downloadUrl = await f.generatePresignURL(filename, {
            expiryInSeconds: 3600,
        })

        // Publish report.generated event
        const eventsClient = await eventsSdk.init({
            orgId:
                params.__ow_headers['x-gw-ims-org-id'] || params.ADOBE_ORG_ID,
            apiKey: params.__ow_headers['x-api-key'] || params.ADOBE_API_KEY,
            accessToken:
                params.__ow_headers['authorization']?.replace('Bearer ', '') ||
                params.ADOBE_ACCESS_TOKEN,
        })

        const eventData = {
            event_id: faker.string.uuid(),
            event_type: 'report.generated',
            source: 'app-builder-enablement',
            source_id: reportId,
            data: {
                report: {
                    id: reportId,
                    filename: filename,
                    rows: rows,
                    size: fileProperties.length,
                    downloadUrl: downloadUrl,
                    generatedAt: new Date().toISOString(),
                },
                metadata: {
                    version: '1.0',
                    source_action: 'generate-report-with-events',
                },
            },
            time: new Date().toISOString(),
        }

        await eventsClient.publishEvent(eventData)
        logger.info('Report generation event published:', eventData.event_id)

        return {
            statusCode: 200,
            body: {
                success: true,
                report: eventData.data.report,
                event: {
                    id: eventData.event_id,
                    type: eventData.event_type,
                    published: true,
                },
            },
        }
    } catch (error) {
        logger.error('Error generating report:', error)
        return errorResponse(
            500,
            `Failed to generate report: ${error.message}`,
            logger
        )
    }
}

exports.main = main
```

### 2. Create a Report Processing Action

```sh
aio app add action
```

Name it `process-report-event`:

```javascript
const { Core } = require('@adobe/aio-sdk')
const stateLib = require('@adobe/aio-lib-state')
const eventsSdk = require('@adobe/aio-lib-events')

async function main(params) {
    const logger = Core.Logger('process-report-event', {
        level: params.LOG_LEVEL || 'info',
    })

    try {
        const eventData = params.data || params

        if (eventData.event_type !== 'report.generated') {
            return {
                statusCode: 200,
                body: { message: 'Event type not handled' },
            }
        }

        const report = eventData.data.report
        const state = await stateLib.init({ region: 'apac' })

        // Store report metadata
        await state.put(
            `report:${report.id}`,
            {
                ...report,
                processed: true,
                processedAt: new Date().toISOString(),
            },
            { ttl: 86400 }
        ) // 24 hours

        // Update report statistics
        const stats = (await state.get('stats:reports')) || {
            total: 0,
            totalRows: 0,
            totalSize: 0,
        }

        stats.total += 1
        stats.totalRows += report.rows
        stats.totalSize += report.size
        stats.lastGenerated = report.generatedAt

        await state.put('stats:reports', stats)

        // Add to recent reports
        const recentReports = (await state.get('reports:recent')) || []
        recentReports.unshift({
            id: report.id,
            filename: report.filename,
            rows: report.rows,
            generatedAt: report.generatedAt,
        })

        if (recentReports.length > 5) {
            recentReports.length = 5
        }

        await state.put('reports:recent', recentReports, { ttl: 7200 })

        // Publish a follow-up event for notification
        const eventsClient = await eventsSdk.init({
            orgId:
                params.__ow_headers['x-gw-ims-org-id'] || params.ADOBE_ORG_ID,
            apiKey: params.__ow_headers['x-api-key'] || params.ADOBE_API_KEY,
            accessToken:
                params.__ow_headers['authorization']?.replace('Bearer ', '') ||
                params.ADOBE_ACCESS_TOKEN,
        })

        await eventsClient.publishEvent({
            event_id: faker.string.uuid(),
            event_type: 'report.processed',
            source: 'app-builder-enablement',
            source_id: report.id,
            data: {
                reportId: report.id,
                processed: true,
                stats: stats,
            },
            time: new Date().toISOString(),
        })

        return {
            statusCode: 200,
            body: {
                success: true,
                reportId: report.id,
                processed: true,
                stats: stats,
            },
        }
    } catch (error) {
        logger.error('Error processing report event:', error)
        return {
            statusCode: 500,
            body: { error: error.message },
        }
    }
}

exports.main = main
```

---

## Step 5: Integrating Events with Storage

Let's create a dashboard action that shows the current state based on all the events.

### 1. Create a Dashboard Action

```sh
aio app add action
```

Name it `events-dashboard`:

```javascript
const { Core } = require('@adobe/aio-sdk')
const stateLib = require('@adobe/aio-lib-state')

async function main(params) {
    const logger = Core.Logger('events-dashboard', {
        level: params.LOG_LEVEL || 'info',
    })

    try {
        const state = await stateLib.init({ region: 'apac' })

        // Fetch all dashboard data
        const [userCount, recentUsers, reportStats, recentReports] =
            await Promise.all([
                state.get('stats:user-count'),
                state.get('users:recent'),
                state.get('stats:reports'),
                state.get('reports:recent'),
            ])

        const dashboard = {
            users: {
                total: userCount || 0,
                recent: recentUsers || [],
            },
            reports: {
                stats: reportStats || { total: 0, totalRows: 0, totalSize: 0 },
                recent: recentReports || [],
            },
            system: {
                lastUpdated: new Date().toISOString(),
                eventsEnabled: true,
            },
        }

        return {
            statusCode: 200,
            body: {
                success: true,
                dashboard: dashboard,
            },
        }
    } catch (error) {
        logger.error('Error fetching dashboard data:', error)
        return {
            statusCode: 500,
            body: { error: error.message },
        }
    }
}

exports.main = main
```

### 2. Test the Complete Workflow

1. **Generate a user** with events: `generate-user-with-events`
2. **Generate a report** with events: `generate-report-with-events`
3. **Check the dashboard**: `events-dashboard`

You should see how events automatically update the system state!

---

## Completion Checklist

☑️ I have **set up Adobe I/O Events** in my Developer Console project.  
☑️ I have **created actions that publish events** when users are generated and reports are created.  
☑️ I have **built event listeners** that automatically process published events.  
☑️ I have **integrated events with storage** to maintain system state.  
☑️ I have **created a dashboard** that shows real-time data based on event-driven updates.  
☑️ I have **tested the complete event-driven workflow** from publication to processing.

---

## Course Summary

🎉 **Congratulations!** You've completed the Adobe App Builder Enablement Course!

### What You've Built

Over 7 weeks, you've created a **fully functional App Builder application** with:

✅ **Week 1**: Understanding of App Builder value and positioning  
✅ **Week 2**: Complete development environment and first app  
✅ **Week 3**: Custom serverless actions and React UI components  
✅ **Week 4**: Live deployment and CI/CD with GitHub Actions  
✅ **Week 5**: Data persistence with State and File Storage  
✅ **Week 6**: API integration using Adobe API Mesh  
✅ **Week 7**: Event-driven architecture with Adobe I/O Events

### Key Skills Acquired

-   **Serverless Development**: Building and deploying functions with Adobe Runtime
-   **Modern React UI**: Creating interfaces with Adobe React Spectrum
-   **Data Management**: Implementing storage solutions for different use cases
-   **API Integration**: Unifying multiple data sources with API Mesh
-   **Event-Driven Architecture**: Building reactive systems with I/O Events
-   **DevOps Practices**: Automated testing, deployment, and monitoring

### Next Steps for Your App Builder Journey

1. **Explore Advanced Features**:

    - Custom authentication providers
    - Advanced API Mesh transformations
    - Complex event workflows
    - Performance optimisation

2. **Build Real Solutions**:

    - Customer data integration platforms
    - Automated workflow systems
    - Real-time dashboards
    - E-commerce extensions

3. **Join the Community**:
    - [Adobe Developer Community](https://developer.adobe.com/community/)
    - [App Builder Forums](https://experienceleaguecommunities.adobe.com/t5/adobe-app-builder/ct-p/adobe-app-builder)
    - [GitHub Discussions](https://github.com/adobe/aio-cli/discussions)

### Resources for Continued Learning

-   **[Adobe App Builder Documentation](https://developer.adobe.com/app-builder/)**
-   **[React Spectrum Components](https://react-spectrum.adobe.com/)**
-   **[Adobe I/O Events Guide](https://developer.adobe.com/events/)**
-   **[API Mesh Documentation](https://developer.adobe.com/graphql-mesh-gateway/)**

> **Thank you for completing the Adobe App Builder Enablement Course!**
>
> You're now equipped to build powerful, scalable applications on Adobe's serverless platform. The skills you've learned will enable you to create sophisticated solutions that integrate seamlessly with Adobe's ecosystem while providing exceptional user experiences.

**Happy building! 🚀**

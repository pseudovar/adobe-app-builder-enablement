# Week 6: API Mesh Deep Dive

**Goal:** Learn how **Adobe API Mesh connects multiple data sources** into a unified GraphQL API that can be consumed by your App Builder applications.

---

## Quick Navigation

-   [Introduction to API Mesh](#introduction-to-api-mesh)
-   [Step 1: Testing GraphQL APIs Directly](#step-1-testing-graphql-apis-directly)
-   [Step 2: Creating Your First Mesh](#step-2-creating-your-first-mesh)
-   [Step 3: Adding a Second GraphQL Source](#step-3-adding-a-second-graphql-source)
-   [Step 4: Adding Transforms and Filters](#step-4-adding-transforms-and-filters)
-   [Step 5: Enabling CORS for Browser Access](#step-5-enabling-cors-for-browser-access)
-   [Step 6: Adding Caching for Performance](#step-6-adding-caching-for-performance)
-   [Step 7: Implementing Request Logging with Hooks](#step-7-implementing-request-logging-with-hooks)
-   [Step 8: Viewing Logs in Your Dashboard](#step-8-viewing-logs-in-your-dashboard)
-   [Completion Checklist](#completion-checklist)
-   [Next Steps](#next-steps)

---

## Introduction to API Mesh

Adobe API Mesh is a powerful tool that allows you to:

-   **Unify multiple APIs** into a single GraphQL endpoint
-   **Transform data** from REST APIs into GraphQL
-   **Add caching, authentication, and rate limiting**
-   **Modify requests and responses** using hooks
-   **Create a consistent interface** for diverse data sources

### Why Use API Mesh?

| Challenge                                  | API Mesh Solution         |
| ------------------------------------------ | ------------------------- |
| Multiple API formats (REST, GraphQL, SOAP) | Single GraphQL interface  |
| Different authentication methods           | Centralised auth handling |
| Rate limiting across services              | Unified rate limiting     |
| Data transformation needed                 | Built-in transformers     |
| Caching requirements                       | Automatic caching layer   |

---

## Step 1: Testing GraphQL APIs Directly

Before we use API Mesh, let's understand what we're working with by testing GraphQL APIs directly.

### 1. Test a Simple GraphQL API

Open **[Postman](https://www.postman.com/)** or **[PostBuster](https://git.corp.adobe.com/foundation/postbuster/releases)** (Adobe's internal version of Insomnia) and create a new POST request:

**URL**: `https://graphqlzero.almansi.me/api`
**Method**: POST
**Headers**: `Content-Type: application/json`

**Body** (raw JSON):

```graphql
query GetUserProfile($userId: ID!) {
    user(id: $userId) {
        id
        name
        username
        email
        phone
        website
        address {
            street
            suite
            city
            zipcode
            geo {
                lat
                lng
            }
        }
        company {
            name
            catchPhrase
            bs
        }
    }
}
```

**Variables** (in the Variables tab):

```json
{
    "userId": "1"
}
```

Click **Send**. You should see:

```json
{
    "data": {
        "user": {
            "id": "1",
            "name": "Leanne Graham",
            "username": "Bret",
            "email": "Sincere@april.biz",
            "phone": "1-770-736-8031 x56442",
            "website": "hildegard.org",
            "address": {
                "street": "Kulas Light",
                "suite": "Apt. 556",
                "city": "Gwenborough",
                "zipcode": "92998-3874",
                "geo": {
                    "lat": -37.3159,
                    "lng": 81.1496
                }
            },
            "company": {
                "name": "Romaguera-Crona",
                "catchPhrase": "Multi-layered client-server neural-net",
                "bs": "harness real-time e-markets"
            }
        }
    }
}
```

### 2. Test Another GraphQL API

Now test the Countries API:

**URL**: `https://countries.trevorblades.com/graphql`  
**Method**: POST  
**Headers**: `Content-Type: application/json`

**Body** (raw JSON):

```graphql
query GetCountryInfo($countryCode: ID!) {
    country(code: $countryCode) {
        name
        native
        capital
        emoji
        currency
        languages {
            code
            name
        }
    }
}
```

**Variables** (in the Variables tab):

```json
{
    "countryCode": "BR"
}
```

You should see data about Brazil.

> 💬 **What's the problem here?**
>
> You need **two separate requests** to get data from both APIs. What if you want user data AND country data together?

---

## Step 2: Creating Your First Mesh

Let's solve this by creating an API Mesh that combines both sources.

### 1. Verify API Mesh Setup

Ensure you have the API Mesh plugin installed (from Week 2):

```sh
aio plugins:install @adobe/aio-cli-plugin-api-mesh
```

Check access:

```sh
aio api-mesh:get
```

It should say you don't have a mesh yet.

### 2. Create Your First Mesh Configuration

Create a file called `mesh.json` in your project root:

```json
{
    "meshConfig": {
        "sources": [
            {
                "name": "users",
                "handler": {
                    "graphql": {
                        "endpoint": "https://graphqlzero.almansi.me/api"
                    }
                }
            }
        ]
    }
}
```

### 3. Deploy Your Mesh

```sh
aio api-mesh:create mesh.json
```

You should see:

```
******************************************************************************************************
Your mesh is being provisioned. Wait a few minutes before checking the status of your mesh aaaaaaaa-0000-aaaa-0000-aaaaaaaaaaaa
To check the status of your mesh, run:
aio api-mesh:status
******************************************************************************************************
Mesh Endpoint: https://edge-sandbox-graph.adobe.io/api/aaaaaaaa-0000-aaaa-0000-aaaaaaaaaaaa/graphql
```

Give it a couple of minutes and after running `aio api-mesh:status` you should see

```
******************************************************************************************************
Mesh provisioned successfully.
******************************************************************************************************
```

### 4. Test Your Mesh

In Postman/PostBuster, test your new mesh endpoint:

**URL**: `https://edge-sandbox-graph.adobe.io/api/aaaaaaaa-0000-aaaa-0000-aaaaaaaaaaaa/graphql`
**Body**:

```graphql
query GetUser($userId: ID!) {
    user(id: $userId) {
        id
        name
    }
}
```

**Variables**:

```json
{
    "userId": "1"
}
```

> 💬 **Same result, but what's the point?**
>
> Right now it's the same, but you now have a **unified endpoint** that you can extend with caching, authentication, and monitoring without touching the original API!

---

## Step 3: Adding a Second GraphQL Source

Now let's add the Countries API to demonstrate the real power of API Mesh.

### 1. Update Your Mesh Configuration

Update your `mesh.json` file:

```json
{
    "meshConfig": {
        "sources": [
            {
                "name": "users",
                "handler": {
                    "graphql": {
                        "endpoint": "https://graphqlzero.almansi.me/api"
                    }
                }
            },
            {
                "name": "countries",
                "handler": {
                    "graphql": {
                        "endpoint": "https://countries.trevorblades.com/graphql"
                    }
                }
            }
        ]
    }
}
```

### 2. Update Your Mesh

```sh
aio api-mesh:update mesh.json
```

### 3. Test the Combined Schema - This is the Real Power!

Now you can query **both data sources in a single request**:

**Body**:

```graphql
query GetUserAndCountry($userId: ID!, $countryCode: ID!) {
    user(id: $userId) {
        id
        name
    }
    country(code: $countryCode) {
        name
        capital
        emoji
        currency
    }
}
```

**Variables**:

```json
{
    "userId": "1",
    "countryCode": "AU"
}
```

You should see:

```json
{
    "data": {
        "user": {
            "id": "1",
            "name": "Leanne Graham"
        },
        "country": {
            "name": "Australia",
            "capital": "Canberra",
            "emoji": "🇦🇺",
            "currency": "AUD"
        }
    }
}
```

> 👏 **You've created a unified API!**
>
> You just combined user data and country data in **one request** instead of two separate API calls! This is the real power of API Mesh.

---

## Step 4: Adding Transforms and Filters

Let's customise the API by renaming fields and filtering data to make it more suitable for our application.

### 1. Add Transforms to Your Configuration

Update your `mesh.json` to add transforms:

```json
{
    "meshConfig": {
        "sources": [
            {
                "name": "users",
                "handler": {
                    "graphql": {
                        "endpoint": "https://graphqlzero.almansi.me/api"
                    }
                },
                "transforms": [
                    {
                        "rename": {
                            "mode": "wrap",
                            "renames": [
                                {
                                    "from": {
                                        "type": "Query",
                                        "field": "user"
                                    },
                                    "to": {
                                        "type": "Query",
                                        "field": "profile"
                                    }
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "name": "countries",
                "handler": {
                    "graphql": {
                        "endpoint": "https://countries.trevorblades.com/graphql"
                    }
                },
                "transforms": [
                    {
                        "prefix": {
                            "mode": "wrap",
                            "value": "geo_",
                            "includeRootOperations": true
                        }
                    },
                    {
                        "filterSchema": {
                            "filters": [
                                "Query.!geo_language",
                                "Query.!geo_languages"
                            ]
                        }
                    }
                ]
            }
        ]
    }
}
```

### 2. Update Your Mesh

```sh
aio api-mesh:update your-mesh-id mesh.json
```

### 3. Test the Transformed Schema

Now test with the new field names:

**Body**:

```graphql
query GetProfileAndGeoCountry($userId: ID!, $countryCode: ID!) {
    profile(id: $userId) {
        id
        name
        email
    }
    geo_country(code: $countryCode) {
        name
        capital
        emoji
    }
}
```

**Variables**:

```json
{
    "userId": "1",
    "countryCode": "AU"
}
```

> 💬 **What happened?**
>
> We **renamed** `user` to `profile` and **added a prefix** `geo_` to all country fields. This lets you customise the API to match your application's naming conventions!

---

## Step 5: Enabling CORS for Browser Access

Your App Builder UI will need to call this mesh endpoint from the browser. Let's enable CORS.

### 1. Add CORS Configuration

Update your `mesh.json`:

> **Important:**
> You _will have to update the allowed URLs_ based on your individual environment needs.
> At the time of writing wildcards are not supported in the domain e.g. https://\*.adobe.com

```json
{
    "meshConfig": {
        "sources": [
            {
                "name": "users",
                "handler": {
                    "graphql": {
                        "endpoint": "https://graphqlzero.almansi.me/api"
                    }
                },
                "transforms": [
                    {
                        "rename": {
                            "mode": "wrap",
                            "renames": [
                                {
                                    "from": {
                                        "type": "Query",
                                        "field": "user"
                                    },
                                    "to": {
                                        "type": "Query",
                                        "field": "profile"
                                    }
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "name": "countries",
                "handler": {
                    "graphql": {
                        "endpoint": "https://countries.trevorblades.com/graphql"
                    }
                },
                "transforms": [
                    {
                        "prefix": {
                            "mode": "wrap",
                            "value": "geo_",
                            "includeRootOperations": true
                        }
                    },
                    {
                        "filterSchema": {
                            "filters": [
                                "Query.!geo_language",
                                "Query.!geo_languages"
                            ]
                        }
                    }
                ]
            }
        ],
        "responseConfig": {
            "CORS": {
                "maxAge": 60480,
                "methods": ["GET", "POST", "PUT", "HEAD", "OPTIONS"],
                "origin": [
                    "http://localhost:3000",
                    "http://localhost:3001",
                    "http://localhost:4321",
                    "http://localhost:5173",
                    "https://demo.adobeaemcloud.com",
                    "https://demo.aem.live",
                    "https://demo.aem.page",
                    "https://experience.adobe.com",
                    "https://developer.adobe.com",
                    "https://demo.adobeio-static.net"
                ]
            }
        }
    }
}
```

### 2. Update Your Mesh

```sh
aio api-mesh:update mesh.json
```

> 💬 **Why is CORS important?**
>
> Without CORS, browsers will block requests from your App Builder UI to the mesh endpoint. Now your frontend can call the API!

---

## Step 6: Adding Caching for Performance

Let's add caching to improve performance - you'll see the difference on repeated queries.

### 1. Add Cache Configuration

Update your `mesh.json` to include caching:

```json
{
    "meshConfig": {
        "sources": [
            {
                "name": "users",
                "handler": {
                    "graphql": {
                        "endpoint": "https://graphqlzero.almansi.me/api"
                    }
                },
                "transforms": [
                    {
                        "rename": {
                            "mode": "wrap",
                            "renames": [
                                {
                                    "from": {
                                        "type": "Query",
                                        "field": "user"
                                    },
                                    "to": {
                                        "type": "Query",
                                        "field": "profile"
                                    }
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "name": "countries",
                "handler": {
                    "graphql": {
                        "endpoint": "https://countries.trevorblades.com/graphql"
                    }
                },
                "transforms": [
                    {
                        "prefix": {
                            "mode": "wrap",
                            "value": "geo_",
                            "includeRootOperations": true
                        }
                    },
                    {
                        "filterSchema": {
                            "filters": [
                                "Query.!geo_language",
                                "Query.!geo_languages"
                            ]
                        }
                    }
                ]
            }
        ],
        "responseConfig": {
            "CORS": {
                "maxAge": 60480,
                "methods": ["GET", "POST", "PUT", "HEAD", "OPTIONS"],
                "origin": [
                    "http://localhost:3000",
                    "http://localhost:3001",
                    "http://localhost:4321",
                    "http://localhost:5173",
                    "https://demo.adobeaemcloud.com",
                    "https://demo.aem.live",
                    "https://demo.aem.page",
                    "https://experience.adobe.com",
                    "https://developer.adobe.com",
                    "https://demo.adobeio-static.net"
                ]
            },
            "includeHTTPDetails": true,
            "cache": true
        }
    }
}
```

### 2. Update Your Mesh

```sh
aio api-mesh:update your-mesh-id mesh.json
```

### 3. Test Caching Performance

API Mesh will respect the caching configuration of your the sources. So if the source is designed to not cache personal information, that will be replicated through API Mesh.

-   Try our query with a `profile` and without.
-   Run the same query mutliple times and notice the response time difference.
-   Also check the response headers, to see which are HIT and MISS

**Query**

```graphql
query TestCaching($userId: ID!, $countryCode: ID!) {
    profile(id: $userId) {
        id
        name
        email
    }
    geo_country(code: $countryCode) {
        name
        capital
        emoji
    }
}
```

**Variables**:

```json
{
    "userId": "1",
    "countryCode": "AU"
}
```

> 💬 **Performance improvement!**
>
> When it's just a country query, and it's already been cached, if should be noticeably faster because it's served from the cache instead of making new API calls.

---

## Step 7: Implementing Request Logging with Hooks

Now let's add monitoring by logging all API Mesh requests to your App Builder storage.

### 1. Create a Hooks File

Create `mesh-hooks.js` to log requests to your App Builder action:

```javascript
module.exports = {
    beforeAll: async ({ context }) => {
        // Non-blocking logging to App Builder action
        // Replace YOUR_ACTION_URL with your actual log-mesh-request action URL
        fetch('YOUR_ACTION_URL', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                timestamp: new Date().toISOString(),
                method: context.request.method,
                url: context.request.url,
                headers: context.request.headers,
                query: context.params?.query?.substring(0, 200) || 'No query',
            }),
        }).catch((err) => {
            console.log('Logging failed:', err)
            return {
                status: 'ERROR',
                message: 'Unable to log request, ' + err.message,
            }
        }) // return fail status

        return {
            status: 'SUCCESS',
            message: 'Request logged successfully',
        } // return success status
    },
}
```

### 2. Update Your Mesh Configuration

Add the hooks to your `mesh.json`:

```json
{
    "meshConfig": {
        "sources": [
            {
                "name": "users",
                "handler": {
                    "graphql": {
                        "endpoint": "https://graphqlzero.almansi.me/api"
                    }
                },
                "transforms": [
                    {
                        "rename": {
                            "mode": "wrap",
                            "renames": [
                                {
                                    "from": {
                                        "type": "Query",
                                        "field": "user"
                                    },
                                    "to": {
                                        "type": "Query",
                                        "field": "profile"
                                    }
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "name": "countries",
                "handler": {
                    "graphql": {
                        "endpoint": "https://countries.trevorblades.com/graphql"
                    }
                },
                "transforms": [
                    {
                        "prefix": {
                            "mode": "wrap",
                            "value": "geo_",
                            "includeRootOperations": true
                        }
                    },
                    {
                        "filterSchema": {
                            "filters": [
                                "Query.!geo_language",
                                "Query.!geo_languages"
                            ]
                        }
                    }
                ]
            }
        ],
        "responseConfig": {
            "CORS": {
                "maxAge": 60480,
                "methods": ["GET", "POST", "PUT", "HEAD", "OPTIONS"],
                "origin": [
                    "http://localhost:3000",
                    "http://localhost:3001",
                    "http://localhost:4321",
                    "http://localhost:5173",
                    "https://demo.adobeaemcloud.com",
                    "https://demo.aem.live",
                    "https://demo.aem.page",
                    "https://experience.adobe.com",
                    "https://developer.adobe.com",
                    "https://demo.adobeio-static.net"
                ]
            },
            "includeHTTPDetails": true,
            "cache": true
        },
        "plugins": [
            {
                "hooks": {
                    "beforeAll": {
                        "composer": "./mesh-hooks.js#beforeAll",
                        "blocking": true
                    }
                }
            }
        ],
        "files": [
            {
                "path": "./mesh-hooks.js"
            }
        ]
    }
}
```

### 3. Deploy with Hooks

```sh
aio api-mesh:update your-mesh-id mesh.json
```

Now all requests will be logged to your App Builder storage for monitoring!

---

## Step 8: Viewing Logs in Your Dashboard

Let's test the complete logging system.

### 1. Test Request Logging

Make a few requests to your mesh endpoint:

**Request 1:**

```graphql
query GetProfile($userId: ID!) {
    profile(id: $userId) {
        id
        name
    }
}
```

**Variables:**

```json
{
    "userId": "1"
}
```

**Request 2:**

```graphql
query GetGeoCountry($countryCode: ID!) {
    geo_country(code: $countryCode) {
        name
        capital
    }
}
```

**Variables:**

```json
{
    "countryCode": "CA"
}
```

### 2. View Your Logs

Use the "Your App Actions" tool to test the `get-mesh-logs` action. You should see your recent API Mesh requests logged with timestamps!

### 3. View in the Dashboard

Navigate to the **Mesh Logs** page in your app to see a real-time view of all API Mesh activity.

> 💬 **Monitoring in action!**
>
> This isn't the best usecase for hooks, however you now have complete visibility into how your API Mesh is being used - request counts, popular queries, and usage patterns!

---

## Bonus: Consuming API Mesh from Your App Builder App

For extra credit, you can create an action that consumes your API Mesh endpoint:

```javascript
// Example mesh-consumer action
const fetch = require('node-fetch')
const { Core } = require('@adobe/aio-sdk')

async function main(params) {
    const logger = Core.Logger('mesh-consumer', {
        level: params.LOG_LEVEL || 'info',
    })

    try {
        const query = `
            query GetProfileAndCountry($userId: ID!, $countryCode: ID!) {
                profile(id: $userId) {
                    id
                    name
                    email
                }
                geo_country(code: $countryCode) {
                    name
                    capital
                    emoji
                }
            }
        `

        const variables = {
            userId: '1',
            countryCode: 'AU',
        }

        const response = await fetch('YOUR_MESH_ENDPOINT', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, variables }),
        })

        const data = await response.json()

        return {
            statusCode: 200,
            body: {
                success: true,
                data: data.data,
                source: 'API Mesh',
            },
        }
    } catch (error) {
        logger.error('Error:', error)
        return { statusCode: 500, body: { error: error.message } }
    }
}

exports.main = main
```

---

## Completion Checklist

☑️ I have **tested GraphQL APIs directly** in Postman/PostBuster to understand the baseline.  
☑️ I have **created my first API Mesh** with a single GraphQL source.  
☑️ I have **added a second GraphQL source** and tested combined queries.  
☑️ I have **added transforms and filters** to customise field names and data.  
☑️ I have **enabled CORS** to allow browser access from my App Builder UI.  
☑️ I have **added caching** and seen the performance improvement on repeated queries.  
☑️ I have **implemented request logging with hooks** to monitor API usage.  
☑️ I have **tested the complete logging system** and viewed logs in my dashboard.

---

## Next Steps

In [**Week 7**](./Week7.md), we'll explore:

-   **Adobe I/O Events** for building reactive, event-driven applications
-   **Publishing events** when user actions occur
-   **Listening for events** and triggering automated responses
-   **Integrating events with storage** for sophisticated workflows

### Extra Challenge

Take your API Mesh skills to the next level:

1. **Implement secrets management** for secure API authentication:

    - Create a `secrets.yaml` file to store sensitive information like API keys and tokens
    - Use the `--secrets` flag when creating or updating your mesh
    - Reference secrets in your mesh configuration using `{context.secrets.SECRET_NAME}` syntax
    - Learn more: [Secrets Management Documentation](https://developer.adobe.com/graphql-mesh-gateway/mesh/advanced/secrets/)

2. **Add a REST API source** using the OpenAPI handler:

    - Find a public REST API with an OpenAPI specification (like JSONPlaceholder, OpenWeather, or any other public API)
    - Configure the OpenAPI handler in your mesh configuration
    - Transform the REST endpoints into GraphQL queries and mutations
    - Learn more: [OpenAPI Handler Documentation](https://developer.adobe.com/graphql-mesh-gateway/mesh/basic/handlers/openapi/)

3. **Combine everything** into a comprehensive mesh that includes:
    - Your existing GraphQL sources
    - A new REST API source with OpenAPI
    - Proper secrets management for any API keys
    - CORS configuration for your specific domains

> 🎉 **Congratulations!**
>
> You've successfully learned how to use Adobe API Mesh to create unified APIs from multiple data sources. This powerful capability enables you to build sophisticated applications that integrate data from across your organisation's systems.

# Week 5: Working with State & File Storage

**Goal:** Learn how to use Adobe App Builder's built-in storage systems—**State Storage** and **File Storage**—to persist and retrieve data.

---

## Quick Navigation

-   [Introduction](#introduction)
-   [Step 1: Understanding Storage Options](#step-1-understanding-storage-options)
-   [Step 2: Using State Storage (Temporary Key/Value)](#step-2-using-state-storage-temporary-keyvalue)
-   [Step 3: Using File Storage (Long-Term Files)](#step-3-using-file-storage-long-term-files)
-   [Completion Checklist](#completion-checklist)
-   [Next Steps](#next-steps)

---

## Introduction

Adobe App Builder includes two powerful built-in storage solutions:

| Storage Type | Use Case                                                           |
| ------------ | ------------------------------------------------------------------ |
| **State**    | Fast, short-term key/value data (e.g., caching, user sessions).    |
| **File**     | Larger, structured files for long-term use (e.g., processed CSVs). |

In this lesson, you'll:

-   Store and retrieve the **last generated user** using **State Storage**.
-   Create and store a **CSV report** using **File Storage**, and retrieve it via API.

---

## Step 1: Understanding Storage Options

### #️⃣ State Storage

-   Designed for **key-value pairs**, like cache or temporary metadata.
-   Low latency, ideal for quick reads/writes.
-   Each entry can have **automatic TTL** (Time to Live).
-   Max key/value size is ~1MB.

### 📂 File Storage

-   Stores **files of any format** (CSV, JSON, PDFs, etc.).
-   Perfect for writing and retrieving **downloadable output**.
-   Max file size: 200GB.
-   Files are **retained long-term** unless manually removed.

To use either, you must install the required packages.

```sh
npm install @adobe/aio-lib-state @adobe/aio-lib-files
```

---

## Step 2: Create New Action with State Storage

Let's create a new version of your `generate-user` action that will also save the user to State Storage.

### 1. Create a new action `generate-user-with-state`

```bash
aio app add action
```

-   Select the `generic action`
-   Call it `generate-user-with-state`
-   Remember to set `require-adobe-auth` to `false` in the `src/dx-excshell-1/ext.config.yaml`

### 2. Replace the function code with the below

```js
const { Core } = require('@adobe/aio-sdk')
const { errorResponse } = require('../utils')
const { faker } = require('@faker-js/faker')
const stateLib = require('@adobe/aio-lib-state')

let cache = null

async function main(params) {
    const logger = Core.Logger('main', { level: params.LOG_LEVEL || 'info' })

    try {
        const data = {
            name: faker.person.fullName(),
            email: faker.internet.email(),
            phone: faker.phone.number({ style: 'international' }),
        }

        await state.put('lastUser', data, { ttl: 60 }) // expire in 1 minute

        const response = {
            statusCode: 200,
            body: {
                dataFrom: 'generated',
                ...data,
            },
        }

        return response
    } catch (error) {
        logger.error(error)
        return errorResponse(500, 'server error', logger)
    }
}

exports.main = main
```

Test your action using the [Your App Actions](https://localhost:9080/#/actions).

### 2. Fetch a cached value if it exists

Add the following code under the `const state` line of code and before the `try` function.

```js
const state = await stateLib.init({ region: 'apac' })

const res = await state.get('lastUser').then((value) => {
    return value
})

if (res) {
    cache = res
    const response = {
        statusCode: 200,
        body: {
            dataFrom: 'state',
            ...res,
        },
    }
    return response
}
```

What happens when you retest this a few times with the [Your App Actions](https://localhost:9080/#/actions).

> 💬 **What is this code doing?**
>
> Why would this be useful in this situation?
> Can you think of other ways you can use this?

### 3. Add another level of caching

Add the following code under the `const logger` declaration at the top of your main function.

```js
if (cache) {
    const response = {
        statusCode: 200,
        body: {
            dataFrom: 'cache',
            ...cache,
        },
    }
    return response
}
```

Test again with [Your App Actions](https://localhost:9080/#/actions), what has changed this time?

> 💬 **What is this code doing?**
>
> How is this different from fetching from the store?
> Why could this be useful in a serverless environment?
> What is wrong with this based on the State expiry settings?

---

## Step 3: Using File Storage (Long-Term Files)

Let's generate a **CSV report** and store it using Adobe File Storage.

### 1. Create `generate-user-report` action

```bash
aio app add action
```

-   Select the `generic action`
-   Call it `generate-user-report`
-   Remember to set `require-adobe-auth` to `false` in the `src/dx-excshell-1/ext.config.yaml`

```js
const files = require('@adobe/aio-lib-files')
const { Parser } = require('json2csv')
const { faker } = require('@faker-js/faker')
const { Core } = require('@adobe/aio-sdk')
const { errorResponse } = require('../utils')

function formatFilename() {
    return `user-report-${Math.floor(Date.now() / 1000)}.csv`
}

function generateData() {
    return {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number({ style: 'international' }),
    }
}

async function main(params) {
    const logger = Core.Logger('main', { level: params.LOG_LEVEL || 'info' })

    if (
        typeof params.rows !== 'undefined' &&
        (isNaN(params.rows) || params.rows < 1 || params.rows > 1000)
    ) {
        return errorResponse(
            400,
            'rows parameter must be a number 1 and 1000',
            logger
        )
    }

    try {
        const data = Array.from({ length: params.rows || 10 }, generateData)

        const filename = `reports/${formatFilename()}`

        const parser = new Parser()
        const csv = parser.parse(data)

        const f = await files.init()
        await f.write(filename, csv)

        const fileData = await f.getProperties(filename)

        const preSignedUrl = await f.generatePresignURL(filename, {
            expiryInSeconds: 60,
        })

        return {
            statusCode: 200,
            body: {
                ...fileData,
                presignUrl: preSignedUrl,
            },
        }
    } catch (error) {
        logger.error(error)
        return errorResponse(500, 'server error', logger)
    }
}

exports.main = main
```

> Optional: Pull data from State Storage or make this dynamic using request parameters!

### 2. Create `get-user-report` action

```js
const files = require('@adobe/aio-lib-files')

async function main(params) {
    const f = await files.init()
    const file = await f.read('reports/user-report.csv')

    return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/csv' },
        body: file.toString(),
    }
}

exports.main = main
```

### 3. Test with fetch or Postman

You can now call:

-   `/api/actions/save-user-report` – to create the file
-   `/api/actions/get-user-report` – to download it

🧪 You've just written and served a **CSV report** using App Builder File Storage!

---

## Completion Checklist

☑️ I have installed and initialized the **State and File Storage libraries**.  
☑️ I have modified an action to **write and retrieve data using State Storage**.  
☑️ I have created another set of actions to **write and read files (CSV) using File Storage**.  
☑️ I have verified the outputs from both storage systems via the browser or API client (like Postman).

Once complete, you're ready for **Week 6: API Mesh Deep Dive**.

---

## Next Steps

In [**Week 6**](./Week6.md), we'll:

-   Learn how to use **Adobe API Mesh** to connect multiple data sources.
-   Add Commerce GraphQL endpoints to API Mesh.
-   Integrate REST APIs through API Mesh.
-   Use Mesh Hooks to modify requests dynamically.

### Extra Challenge

Try enhancing the storage work:

-   Modify your CSV reporting action to **add a timestamp in the filename** (`user-report-2024-04-22.csv`).
-   Store multiple users as separate entries with a prefix (`user:123`, `user:456`) and use `state.list({ prefix: 'user:' })` to retrieve them.

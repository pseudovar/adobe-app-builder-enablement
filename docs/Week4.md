# Week 4: Deploying & Using Storage

**Goal:** Learn how to:

-   Deploy your project manually and via GitHub Actions.
-   Use State Storage for **caching user-generated data**.
-   Use File Storage for **saving and retrieving reports (CSV files)**.

---

## Quick Navigation

-   [Step 1: Deploying the App Manually](#step-1-deploying-the-app-manually)
-   [Step 2: Configuring GitHub Actions for Deployment](#step-2-configuring-github-actions-for-deployment)
-   [Step 3: Saving & Retrieving Data Using State Storage](#step-3-saving--retrieving-data-using-state-storage)
-   [Step 4: Uploading & Downloading Files with File Storage](#step-4-uploading--downloading-files-with-file-storage)
-   [Completion Checklist](#completion-checklist)
-   [Next Steps](#next-steps)

---

## Step 1: Deploying the App Manually

First, let's deploy the app manually to **Adobe I/O Runtime**.

1. Run the following command:
    ```sh
    aio app deploy
    ```
2. Use copy & paste, or <kbd>CMD+Click</kbd> to open your application link, either directly or within the Experience Cloud Shell.
   Test out some of your pages and actions.
3. Take your `generated-user` action URL, and run it in [PostBuster](https://adobe.service-now.com/esc?id=adb_esc_kb_article&sysparm_article=KB0020542) or [Postman](https://adobe.service-now.com/esc?id=adb_esc_sc_cat_item&sys_id=b0fd78a097cadd10c8eeb7e3a253afe3)

> 🎉 **Your app is now be accessible online!**
> Your can even try calling your **action APIs** from [Adobe Workfront Fusion](https://experience.adobe.com/#/so:WorkfrontFusion4924/fusion) and [Microsoft Power Automate](https://make.powerautomate.com/).

---

## Step 2: Configuring GitHub Actions for Deployment

Most Continuous Integration/Continuous Deployment involves a pipeline for deployment so it's fast and repeatable. The default with App Builder is [GitHub Actions](https://github.com/features/actions), however, these can be translated to any other platform.

Since this repository already includes a **GitHub Actions workflow**, let's configure it to automatically deploy on every push.

### **1. Add Required GitHub Secrets**

Go to **GitHub Repo** → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**, then add the following:

| **Secret Name**         | **Description**                          |
| ----------------------- | ---------------------------------------- |
| `AIO_RUNTIME_NAMESPACE` | Your Adobe I/O Runtime namespace.        |
| `AIO_RUNTIME_AUTH`      | The authentication token for Adobe I/O.  |
| `AIO_ORG_ID`            | Your Adobe Organization ID.              |
| `AIO_PROJECT_ID`        | Your Adobe Developer Console Project ID. |
| `AIO_API_KEY`           | Your Adobe API Key.                      |
| `AIO_CLIENT_SECRET`     | Your Adobe Client Secret.                |

### **2. Triggering a Deployment via GitHub Actions**

Once the secrets are in place, GitHub Actions will **automatically deploy on push to main**.

Push changes to `main`:

```sh
git add .
git commit -m "Deploying via GitHub Actions"
git push origin main
```

Then, check your **GitHub Actions workflow** under **GitHub → Actions**.

---

## Step 3: Saving & Retrieving Data Using State Storage

### **State Storage Use Case: Caching Last Generated User**

We'll store the **last generated user** in State Storage so that it persists between refreshes.

### **1. Install Adobe I/O State Storage Package**

Run:

```sh
npm install @adobe/aio-lib-state
```

### **2. Modify the `generate-user` Action to Save Data**

Open `actions/generate-user/index.js` and update:

```js
const { Core } = require('@adobe/aio-sdk')
const { faker } = require('@faker-js/faker')
const stateLib = require('@adobe/aio-lib-state')

async function main(params) {
    const logger = Core.Logger('main', { level: params.LOG_LEVEL || 'info' })

    const user = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
    }

    logger.info('Generated user:', user)

    // Store latest user in state storage
    const state = await stateLib.init()
    await state.put('lastUser', user, { ttl: 3600 }) // 1 hour expiry

    return { body: user }
}

exports.main = main
```

### **3. Modify the UI to Retrieve & Display Last User on Load**

Inside `Welcome.js`, fetch the last user:

```js
import React, { useEffect, useState } from 'react'

export const Welcome = () => {
    const [user, setUser] = useState(null)

    useEffect(() => {
        async function fetchUser() {
            const response = await fetch('/api/actions/get-last-user')
            const data = await response.json()
            setUser(data)
        }
        fetchUser()
    }, [])

    return (
        <div>
            <h1>Welcome to Adobe App Builder</h1>
            {user ? (
                <div>
                    <h3>Last User</h3>
                    <p>
                        {user.firstName} {user.lastName}
                    </p>
                    <p>{user.email}</p>
                </div>
            ) : (
                <p>No stored user found.</p>
            )}
        </div>
    )
}
```

📌 **Now, your app will remember the last generated user across refreshes!**

---

## Step 4: Uploading & Downloading Files with File Storage

### **File Storage Use Case: Storing & Retrieving CSV Reports**

Users can generate a **CSV report** with stored user data and retrieve it later.

### **1. Install File Storage Library**

Run:

```sh
npm install @adobe/aio-lib-files
```

### **2. Create a New Action for Saving the CSV File**

Create `actions/save-report.js` and add:

```js
const filesLib = require('@adobe/aio-lib-files')
const { Parser } = require('json2csv')

async function main(params) {
    const files = await filesLib.init()

    // Example data - normally retrieved dynamically from storage
    const users = [{ name: 'John Doe', email: 'john@example.com' }]

    const parser = new Parser()
    const csv = parser.parse(users)

    await files.write('reports/users.csv', csv)

    return { body: 'Report saved successfully!' }
}

exports.main = main
```

### **3. Retrieve and Display Saved Reports**

Create `actions/get-report.js`:

```js
const filesLib = require('@adobe/aio-lib-files')

async function main(params) {
    const files = await filesLib.init()
    const csv = await files.read('reports/users.csv')

    return { body: csv.toString() }
}

exports.main = main
```

📌 **Now, users can generate and retrieve reports dynamically!**

---

## Completion Checklist

☑️ I have **deployed the app manually using `aio app deploy`**.  
☑️ I have **configured GitHub Secrets to enable GitHub Actions deployments**.  
☑️ I have **retrieved and displayed the last generated user using State Storage**.  
☑️ I have **generated and saved a CSV report using File Storage**.  
☑️ I have **retrieved and displayed stored reports within the UI**.

Once all steps are completed, you're ready for **Week 5: Event-Driven Development!** 🚀

---

## Next Steps

In [**Week 5**](./Week5.md), we will:

-   Explore **Adobe I/O Events** and event-based workflows.
-   Create an event-driven action that **publishes an event** after a user is generated.
-   Build an event listener action to **react to an event and modify storage dynamically**.

If you want extra practice, try:

-   Modifying the **CSV generation** to save multiple files with timestamps.
-   Filtering State Storage keys using `.list({ prefix: "user:" })`.

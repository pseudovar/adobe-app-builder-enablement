---
Type: Enablement
tags:
    [
        AdobeSpectrum,
        API,
        APIMesh,
        AppBuilder,
        GitHub,
        NPM,
        React,
        SinglePageApplication,
        SolutionConsultant,
    ]
date created: 2025 03 04 09:22:39
date modified: 2025 03 04 09:27:47
---

## Next Steps

-   [ ] A GitHub repository structure with starter files & instructions?
-   [ ] A detailed step-by-step guide for each session?
-   [ ] An introduction deck to present at Week 1?

## Course Material

Each session is **30 minutes**, fully **hands-on**, and follows a structured progression.

### Week 1: Introduction & Positioning

**Goal:** Understand **Adobe App Builder’s value, use cases, and architecture**.

-   What is Adobe App Builder? Key capabilities.
-   Where does it fit in Adobe's ecosystem?
-   Use case positioning – when to use App Builder.
-   Understanding how this programme works.
-   Overview of GitHub Repository: Cloning the repo, structure walkthrough.

Exercise: No hands-on exercise this week – focus on positioning.

---

### Week 2: Environment Setup & First App

**Goal:** Set up access, install essentials, create & inspect an application.

-   Getting Access to Adobe IO.
-   Installing necessary tools (CLI, Node.js).
-   Creating a new App via Developer Console.
-   Cloning the GitHub repo & linking to the created app.
-   Running the app locally & inspecting logs.

**Exercise:** Set up App Builder locally, run the first app.

---

### Week 3: Working with Actions & UI

**Goal:** Build a **serverless function** and display its output in a **React UI**.

-   Creating an Action with **FakerJS (random user details generator)**.
-   Editing local UI to display **generated user details**.
-   Adding a refresh button to fetch a new user.
-   Debugging locally with CLI tools.

**Exercise:** Modify UI & action to display random user details, refreshing when clicked.

---

### Week 4: Deploying & Using Storage

**Goal:** Deploy a **live app** and persist data using **App Builder Storage**.

-   Deploying/pushing code to Adobe IO.
-   Understanding File & State Storage.
-   Writing & Reading from Storage.
-   Updating UI to fetch the last stored user on load.

**Exercise:** Store random user details in App Builder Storage and persist them.

---

### Week 5: Working with Storage

**Goal:** Learn how to use **App Builder Storage** for data persistence.

-   Understanding State Storage vs File Storage.
-   Writing & Reading from State Storage.
-   Creating and storing files with File Storage.
-   Building CSV reports and file downloads.

**Exercise:**

1. Store random user details in State Storage with caching.
2. Create CSV reports using File Storage.
3. Implement file downloads and pre-signed URLs.

---

### Week 6: API Mesh Deep Dive

**Goal:** Learn **how API Mesh connects multiple data sources** into a unified API.

-   Adding a Commerce GraphQL endpoint to API Mesh.
-   Adding a REST API (Open API compatible) to API Mesh.
-   Adding a REST API (non-Open API).
-   Using a Mesh Hook (beforeAll) to modify requests.

**Exercise:**

1. Fetch product data from Commerce API via API Mesh.
2. Call a REST API inside API Mesh.
3. Modify request parameters dynamically using API Mesh Hook.

---

### Week 7: Working with Adobe I/O Events

**Goal:** Understand **event-driven development** inside App Builder.

-   What are Adobe I/O Events?
-   Creating an Action to publish an event.
-   Creating an Action to listen & react to an event.
-   Updating UI in response to an event trigger.

**Exercise:**

1. Publish an Event when a new user is generated.
2. Listen for the Event and log the received data.
3. Modify stored user details when an event fires.

---

### End Result

The team will have built a **fully functional App Builder project** including:

-   Serverless functions
-   UI interactions
-   Storage capabilities
-   Event-driven behavior
-   Commerce & REST API integrations via API Mesh

**Total Course Duration:** 7 weeks (30 minutes each session)

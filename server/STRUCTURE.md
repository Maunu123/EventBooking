# 🏗️ Backend Architecture, Code Structure & 0-to-1 Year Developer Master Guide

> **Purpose of this document:**
> 1. Complete architectural blueprint of this Node.js / Express / MongoDB backend.
> 2. Standard template & rules you can hand over to any developer or AI (like ChatGPT / Claude) to build future backends using this exact clean structure.
> 3. Exhaustive study curriculum covering every topic, subtopic, concept, code pattern, and interview question required for a backend developer from **0 to 1 year of professional experience**.

---

## 📁 1. Project Directory Structure

```
server/
├── app.js                          # Express application configuration & route mounting
├── server.js                       # Server startup (DB connection & port listening)
├── package.json                    # Dependencies & scripts
└── src/
    ├── config/
    │   └── db.js                   # MongoDB connection logic using Mongoose
    ├── controllers/
    │   ├── authController.js       # Register, Login, Me, Logout handlers
    │   ├── bookingController.js    # User bookings & demo checkout logic
    │   ├── contactController.js    # Contact enquiry handler
    │   └── eventController.js      # Public & organizer event handlers
    ├── middlewares/
    │   ├── authMiddleware.js       # Session check & role authorization (requireOrganizer)
    │   ├── errorHandler.js         # Centralized error handler
    │   ├── originMiddleware.js     # Origin verification & rate limiting
    │   └── validatorMiddleware.js  # Request body validation & sanitization
    ├── models/
    │   ├── bookingModel.js         # Mongoose schema for Bookings
    │   ├── enquiryModel.js         # Mongoose schema for Contact Enquiries
    │   ├── eventModel.js           # Mongoose schema for Events
    │   ├── sessionModel.js         # Mongoose schema for Sessions
    │   └── userModel.js            # Mongoose schema for Users
    ├── routes/
    │   ├── authRoutes.js           # Express router for /api/auth
    │   ├── bookingRoutes.js        # Express router for /api/bookings
    │   ├── contactRoutes.js        # Express router for /api/contact
    │   └── eventRoutes.js          # Express router for /api/events
    └── utils/
        ├── formatters.js           # Currency (INR) and Date/Time formatters
        ├── pricing.js              # Tier pricing multipliers & promo discounts
        ├── requestOrigin.js        # Origin validation helper
        ├── validators.js           # Regex & input cleaners (email, phone, aadhaar, pan)
        └── index.js                # Centralized export of all utility helpers
```

---

## 🔄 2. Request Lifecycle (How Data Flows)

Whenever a client sends a request to the backend, it flows step-by-step through standard layers:

```
[ Client Request ]
       │
       ▼
[ server.js ] ──────────────► Starts process, connects DB & listens on PORT
       │
       ▼
[ app.js ] ────────────────► app.use(express.json()) + app.use('/api', originMiddleware)
       │
       ▼
[ src/routes/* ] ──────────► Matches path (e.g., POST /api/events)
       │
       ▼
[ src/middlewares/* ] ─────► 1. authenticateUser (validates cookie/session)
       │                     2. requireOrganizer (checks user.role === 'organizer')
       │                     3. validateEvent (checks required fields, data types)
       ▼
[ src/controllers/* ] ─────► Handles business logic, interacts with Mongoose Models
       │
       ▼
[ src/models/* ] ──────────► Executes MongoDB queries (create, find, update)
       │
       ▼
[ Database (MongoDB) ]
       │
       ▼
[ Controller Response ] ───► res.status(201).json({ ... })
       │
(If error occurs) ─────────► Passes to errorHandler (src/middlewares/errorHandler.js)
```

---

## 📐 3. Standard Code Blueprint (Rules for Future Projects)

When creating new modules or telling an AI/developer to add features, follow these standard rules:

### Rule 1: Models (`src/models/XYZModel.js`)
- Define Schema with types, required constraints, and timestamps (`timestamps: true`).
- Export Mongoose Model.
```javascript
const mongoose = require('mongoose');

const sampleSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

const Sample = mongoose.models.Sample || mongoose.model('Sample', sampleSchema);
module.exports = Sample;
```

### Rule 2: Middlewares (`src/middlewares/`)
- Pure functions taking `(req, res, next)`.
- If invalid &rarr; return early with appropriate status (`400`, `401`, `403`).
- If valid &rarr; attach sanitized data to `req` (e.g. `req.user`, `req.validatedBody`) and call `next()`.

### Rule 3: Controllers (`src/controllers/XYZController.js`)
- Async functions taking `(req, res)`.
- Wrap in `try ... catch` blocks.
- Perform database operations via Mongoose models.
- Send clear JSON responses (`res.status(200).json(...)`).
```javascript
const Sample = require('../models/sampleModel');

const getSamples = async (req, res) => {
    try {
        const items = await Sample.find().lean();
        res.status(200).json({ items });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch items.' });
    }
};

module.exports = { getSamples };
```

### Rule 4: Routes (`src/routes/XYZRoutes.js`)
- Use standard `express.Router()`.
- Chain middlewares before controller: `router.post('/', authenticateUser, validateBody, controllerFn)`.
- Export `router`.

### Rule 5: Mount in `app.js`
- Mount router cleanly: `app.use('/api/sample', sampleRoutes)`.

---

## 🎓 4. Comprehensive Backend Developer Study


### 🌐 Module 1: Web & Networking Fundamentals

#### 1.1 The Client-Server Model & DNS
- **Client (Frontend)**: Browser, mobile app, or Postman requesting data.
- **Server (Backend)**: Listens on an IP address and Port for incoming TCP connections.
- **DNS (Domain Name System)**: Translates human-friendly domain names (`api.example.com`) into computer-routable IP addresses (`142.250.190.46`).

#### 1.2 HTTP / HTTPS Protocol & Handshake
- **HTTP (Hypertext Transfer Protocol)**: Application-layer protocol running over TCP.
- **HTTPS (HTTP Secure)**: HTTP wrapped in TLS/SSL encryption.
  - **TLS Handshake**: Client and server agree on TLS version, cipher suite, and verify the server's SSL certificate before exchanging encrypted data.
- **HTTP/1.1 vs HTTP/2 vs HTTP/3**:
  - *HTTP/1.1*: Sequential requests per TCP connection (Head-of-line blocking).
  - *HTTP/2*: Multiplexing (multiple streams over a single TCP connection), header compression (HPACK).
  - *HTTP/3*: Runs over UDP using QUIC for faster connection establishment and zero head-of-line blocking.

#### 1.3 HTTP Methods & Idempotency
- **Idempotency**: An HTTP method is idempotent if calling it multiple times produces the identical server state as calling it once.
  - `GET`: Safe & Idempotent (Read data, no side-effects).
  - `POST`: Neither safe nor idempotent (Creates a new record every call).
  - `PUT`: Idempotent (Replaces the entire resource).
  - `PATCH`: Non-idempotent (Updates partial fields of a resource).
  - `DELETE`: Idempotent (Deleting an already deleted item still results in the item being deleted).
  - `OPTIONS`: Returns allowed HTTP methods and CORS headers for a route.

#### 1.4 HTTP Status Codes Taxonomy
- **2xx (Success)**:
  - `200 OK`: Request succeeded.
  - `201 Created`: Resource created successfully (Standard for `POST`).
  - `204 No Content`: Success, but no content in body (Standard for `DELETE`).
- **3xx (Redirection)**:
  - `301 Moved Permanently`: Permanent redirect (SEO preserved).
  - `304 Not Modified`: Cached copy on client is still valid.
- **4xx (Client Errors)**:
  - `400 Bad Request`: Validation failure (missing fields, wrong types).
  - `401 Unauthorized`: Missing or invalid authentication token/session.
  - `403 Forbidden`: Authenticated, but lacking permission/role.
  - `404 Not Found`: Route or resource does not exist.
  - `409 Conflict`: Duplicate unique key (e.g., user email already registered).
  - `422 Unprocessable Entity`: Semantic validation failed.
  - `429 Too Many Requests`: Rate limit threshold exceeded.
- **5xx (Server Errors)**:
  - `500 Internal Server Error`: Uncaught code exception / bug.
  - `502 Bad Gateway`: Upstream proxy or server failure.
  - `503 Service Unavailable`: Database down, server overloaded, or maintenance.
  - `504 Gateway Timeout`: Upstream service took too long to reply.

---

### ⚙️ Module 2: Node.js Internals & Asynchronous Runtime

#### 2.1 The V8 Engine + Libuv Architecture
- **V8 Engine** (by Google): Compiles JavaScript into machine code (Call Stack, Memory Heap).
- **Libuv** (C++ Library): Provides the cross-platform asynchronous I/O engine, Event Loop, and a background Worker Thread Pool (default 4 threads, configurable via `UV_THREADPOOL_SIZE`).
- **Single-Threaded Execution**: All JavaScript application code runs on a single main thread. Asynchronous I/O operations (file system, DNS, crypto, database network calls) are offloaded to Libuv/OS kernel.


#### 2.3 Microtasks vs Macrotasks
Between each phase of the Event Loop, Node.js exhausts the **Microtask Queue**:
- **Microtask Queue Priority**:
  1. `process.nextTick()` (Highest priority, runs before all other microtasks).
  2. `Promise.then()` / `await` callbacks.
- **Macrotasks**: `setTimeout`, `setInterval`, `setImmediate`, I/O callbacks.
> **Key Rule**: Microtasks always run before the event loop moves to the next phase or executes the next macrotask.

#### 2.4 Streams & Buffers
- **Buffer**: A chunk of raw memory allocated outside the V8 heap (used for binary data like images, file chunks).
- **Streams**: Handling data piece-by-piece without loading the entire payload into RAM:
  - *Readable*: `fs.createReadStream()`
  - *Writable*: `fs.createWriteStream()`, `res` in Express.
  - *Duplex*: Both read and write (e.g., TCP socket).
  - *Transform*: Modifies data while reading/writing (e.g., `zlib.createGzip()`).
  - *Piping*: `readableStream.pipe(writableStream)`.

---

### 🚀 Module 3: Express.js Architecture & Middleware Mechanics

#### 3.1 What is Express.js?
Express is a minimalist, unopinionated web framework built on top of Node.js `http.createServer()`. It introduces **Routing** and **Middleware Pipelines**.

#### 3.2 The Middleware Pipeline
A middleware is a function that receives `(req, res, next)`.
```javascript
const loggingMiddleware = (req, res, next) => {
    console.log(`${req.method} ${req.url} at ${new Date().toISOString()}`);
    next(); // Pass control to the next middleware in line
};
```
- **Rules of `next()`**:
  - `next()`: Advances to the next middleware in the stack.
  - `next('route')`: Skips the rest of the middleware functions in the current router block.
  - `next(error)`: Skips all remaining normal middlewares and jumps straight to the **Error Handling Middleware**.

#### 3.3 Centralized Error Handling Pattern
Always define your global error handler at the very end of `app.js` with **4 parameters**:
```javascript
const errorHandler = (err, req, res, next) => {
    console.error('Unhandled Error:', err.stack);
    const status = err.statusCode || 500;
    res.status(status).json({
        success: false,
        error: err.message || 'Internal Server Error'
    });
};
module.exports = { errorHandler };
```

#### 3.4 Operational vs Programmer Errors
- **Operational Errors**: Known, predictable runtime issues (e.g., Invalid input &rarr; `400`, User not found &rarr; `404`, Database timeout &rarr; `503`). Handle gracefully with clean JSON responses.
- **Programmer Errors**: Bugs, syntax errors, reading properties of `undefined`. Fix via code review, tests, and crash-safely.

---

### 📡 Module 4: RESTful API Engineering Standards

#### 4.1 Resource-Oriented URI Design
- Use **plural nouns**, never verbs:
  - ✅ `GET /api/events` (Get all events)
  - ✅ `POST /api/events` (Create an event)
  - ✅ `GET /api/events/:id` (Get event by ID)
  - ✅ `PUT /api/events/:id` (Update event)
  - ✅ `DELETE /api/events/:id` (Delete event)
  - ❌ `GET /api/getEvents`
  - ❌ `POST /api/create-event`
  - ❌ `POST /api/deleteEvent`

#### 4.2 Standard API Response Structure
Maintain a predictable JSON envelope across all endpoints:
```json
{
  "success": true,
  "data": {
    "events": [...]
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50
  }
}
```

#### 4.3 Pagination, Sorting & Filtering
- **Offset Pagination**: `GET /api/events?page=2&limit=10` (`skip = (page - 1) * limit`).
- **Cursor Pagination** (Best for large datasets): `GET /api/events?cursor=64f1a2b3c&limit=10` (query `_id > cursor`).
- **Sorting**: `GET /api/events?sort=-createdAt` (descending by createdAt).
- **Filtering**: `GET /api/events?category=Workshop&price_lte=1000`.

#### 4.4 Idempotency Keys (Payment & Booking Safety)
- To prevent duplicate charges/bookings when network drops, clients send a unique `key` (UUID):
```javascript
const existing = await Booking.findOne({ userId: req.user.id, key: req.body.key });
if (existing) {
    return res.status(200).json({ booking: existing }); // Return cached result without re-billing
}
```

---

### 💾 Module 5: Database Engineering (MongoDB & Mongoose)

#### 5.1 SQL vs NoSQL Trade-offs
| Feature | SQL (PostgreSQL, MySQL) | NoSQL (MongoDB) |
| :--- | :--- | :--- |
| **Data Structure** | Tabular (Rows & Columns) | Document-based (BSON / JSON) |
| **Schema** | Rigid, predefined | Flexible, dynamic |
| **Scaling** | Vertical (Scale Up) | Horizontal (Scale Out / Sharding) |
| **Best For** | Complex multi-table JOINs, financial ledger | Fast iteration, hierarchical data, high write throughput |

#### 5.2 Mongoose Schema, Model & Validation
```javascript
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format']
    },
    role: {
        type: String,
        enum: ['buyer', 'organizer', 'admin'],
        default: 'buyer'
    }
}, { timestamps: true });
```

#### 5.3 Mongoose Performance Optimizations
1. **`.lean()`**: Bypasses Mongoose document wrapping; returns plain JS objects. **Up to 5x faster read queries**.
   ```javascript
   const events = await Event.find().lean();
   ```
2. **Field Projections (`.select()`)**: Fetch only the fields you need over the network.
   ```javascript
   const user = await User.findById(id).select('name email role -_id');
   ```
3. **Indexes**:
   - Single field index: `userSchema.index({ email: 1 });`
   - Compound index: `bookingSchema.index({ userId: 1, key: 1 }, { unique: true });`
   - TTL (Time To Live) index for expiring sessions: `sessionSchema.index({ expires: 1 }, { expireAfterSeconds: 0 });`

#### 5.4 Relationships: Embedding vs Referencing
- **Embedding (Subdocuments)**: Use when data is tightly coupled and always read together (e.g. `customer` inside `booking`).
- **Referencing (`ObjectId`)**: Use when data is large, unbounded, or shared across multiple entities (e.g. `ownerId` referencing `User`).

#### 5.5 Mongoose Aggregation Pipeline
Process data through multi-stage pipelines:
```javascript
const stats = await Booking.aggregate([
    { $match: { status: 'confirmed' } },
    { $group: { _id: '$eventId', totalRevenue: { $sum: '$totalPaise' }, count: { $sum: 1 } } },
    { $sort: { totalRevenue: -1 } }
]);
```

---

### 🔒 Module 6: Authentication, Authorization & Web Security

#### 6.1 Authentication vs Authorization
- **Authentication (AuthN)**: "Who are you?" (Register, Login, Password Verification).
- **Authorization (AuthZ)**: "What permissions do you have?" (Role-Based Access Control / RBAC).

#### 6.2 Password Security & Hashing
- **Never store plain text passwords.**
- **Salt**: Random cryptographic string appended to passwords before hashing to prevent Rainbow Table attacks.
- **Algorithms**: `scrypt`, `bcrypt`, or `argon2`.
- **Timing Attacks**: Use `crypto.timingSafeEqual()` to prevent timing-based character guessing.

#### 6.3 Session-Based Auth vs JWT
| Criteria | Session-Based Auth (Stateful) | JWT Auth (Stateless) |
| :--- | :--- | :--- |
| **Storage** | Stored on Server (DB/Redis) | Stored in Client (localStorage/Cookie) |
| **Token Size** | Small (Random Session ID) | Larger (Contains encoded payload & signature) |
| **Revocation** | **Instant**: Delete session from DB | Harder: Requires token blacklist in Redis |
| **Best For** | Traditional web apps, banking, SaaS | Microservices, mobile apps |

#### 6.4 Secure Cookie Attributes
When setting authentication cookies, always configure:
- `HttpOnly`: Prevents JavaScript `document.cookie` access (Immunizes against XSS cookie theft).
- `SameSite=Lax`: Defends against Cross-Site Request Forgery (CSRF).
- `Secure`: Ensures cookie is only sent over HTTPS (in production).
- `Max-Age`: Defines expiration window.

#### 6.5 OWASP Top 10 Security Defenses
1. **NoSQL Injection**: Always sanitize query inputs. Avoid passing raw `req.body` directly into database queries.
2. **Cross-Site Scripting (XSS)**: Sanitize string inputs; set `HttpOnly` on cookies; escape HTML output.
3. **Cross-Site Request Forgery (CSRF)**: Enforce `SameSite` cookies and origin validation.
4. **Rate Limiting**: Defend against brute force and DDoS using in-memory or Redis sliding window limiters.
5. **CORS (Cross-Origin Resource Sharing)**: Restrict allowed origins to your frontend domain only.

---

### 🛡️ Module 7: Input Validation & Defensive Coding

#### 7.1 Golden Rule: "Never Trust Client Data"
Client-side validation is for UX only. The server must validate and sanitize all data before processing:
1. **Sanitization**: Trim whitespace, limit maximum string lengths, remove control characters.
2. **Type Checking**: Verify numbers are finite integers, booleans are booleans, dates are valid ISO strings.
3. **Format Validation**: Validate with precise Regular Expressions (Email, Phone, Government IDs like Aadhaar & PAN).

#### 7.2 Validation Middleware Pattern
```javascript
const validateEvent = (req, res, next) => {
    const { title, pricePaise, capacity, startDate } = req.body || {};
    
    if (!title || typeof title !== 'string' || title.trim().length > 120) {
        return res.status(400).json({ error: 'Valid title (up to 120 chars) is required.' });
    }
    if (!Number.isInteger(pricePaise) || pricePaise < 0) {
        return res.status(400).json({ error: 'Price must be a positive integer in paise.' });
    }
    if (!Number.isInteger(capacity) || capacity < 1) {
        return res.status(400).json({ error: 'Capacity must be at least 1 attendee.' });
    }
    if (isNaN(Date.parse(startDate)) || Date.parse(startDate) <= Date.now()) {
        return res.status(400).json({ error: 'Start date must be a valid future date.' });
    }

    req.validatedEvent = { title: title.trim(), pricePaise, capacity, startDate };
    next();
};
```

---

### 🛠️ Module 8: Production Engineering, DevOps & Best Practices

#### 8.1 The 12-Factor App Principles
- **Config in Environment**: Store secrets, database URIs, API keys, and port numbers in `.env` files, never committed to git.
- **Stateless Processes**: The backend processes should share no state; rely on databases or cache stores for persistence.
- **Port Binding**: Export services via port binding (e.g. `app.listen(PORT)`).

#### 8.2 Graceful Shutdown
When a deployment happens or a server restarts, finish existing in-flight HTTP requests before terminating the process:
```javascript
const server = app.listen(PORT);

const shutdown = async () => {
    console.log('Stopping server gracefully...');
    server.close(async () => {
        await mongoose.connection.close();
        console.log('DB connection closed. Exiting process.');
        process.exit(0);
    });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
```

#### 8.3 Testing Pyramid
- **Unit Tests**: Test pure utility functions, formatters, calculators in isolation (fast, reliable).
- **Integration Tests**: Test routes, middlewares, controllers, and database queries working together.
- **End-to-End (E2E) Tests**: Test full client-to-server workflows.

---

### 🎯 Module 9: Top 25 Real-World Backend Interview Questions & Answers

#### Q1: What is the difference between synchronous and asynchronous code in Node.js?
> **Answer:** Synchronous code executes sequentially and blocks the Call Stack until finished. Asynchronous code offloads long-running operations (I/O, timers, DB queries) to the OS/Libuv and executes a callback/Promise once complete without blocking the main thread.

#### Q2: What is the Node.js Event Loop?
> **Answer:** An infinite loop managed by Libuv that monitors the Call Stack and moves callbacks from various task queues (Timers, I/O, Poll, Check) into the Call Stack whenever it is empty.

#### Q3: What is the difference between `process.nextTick()` and `setImmediate()`?
> **Answer:** `process.nextTick()` runs immediately after the current operation finishes, before any other I/O or timer macrotask. `setImmediate()` runs during the "Check" phase of the event loop.

#### Q4: Why is Node.js not recommended for CPU-heavy tasks?
> **Answer:** Because Node.js runs JS on a single thread. CPU-intensive operations (video encoding, complex math calculations) block the Call Stack, preventing the event loop from processing any other incoming requests. For CPU tasks, use Worker Threads or a separate microservice.

#### Q5: What is Middleware in Express.js?
> **Answer:** A function with access to the Request object (`req`), Response object (`res`), and the `next` function in the application's request-response cycle. It is used for logging, authentication, validation, and error handling.

#### Q6: How does Express know a middleware is an Error Handling Middleware?
> **Answer:** By having exactly **4 arguments**: `(err, req, res, next)`. Express checks the function arity (`fn.length === 4`).

#### Q7: What is the difference between `app.use()` and `app.get()`?
> **Answer:** `app.use()` matches any HTTP method starting with the specified path prefix (used for middlewares and sub-routers). `app.get()` matches only HTTP `GET` requests with the exact route path.

#### Q8: What is CORS and why is it needed?
> **Answer:** Cross-Origin Resource Sharing (CORS) is a browser security mechanism that restricts a web page from making AJAX requests to a different domain/port than the one that served the web page, unless the server explicitly allows it via `Access-Control-Allow-Origin` headers.

#### Q9: What is a preflight request?
> **Answer:** An HTTP `OPTIONS` request sent automatically by browsers before non-simple requests (e.g. `POST`/`PUT` with `application/json` or custom headers) to verify if the server permits the actual request.

#### Q10: What is the difference between `PUT` and `PATCH`?
> **Answer:** `PUT` replaces the entire target resource with the uploaded payload. `PATCH` applies partial modifications to specific fields of the resource.

#### Q11: What is the difference between `401 Unauthorized` and `403 Forbidden`?
> **Answer:** `401` means authentication is missing or invalid (Identity unknown). `403` means authentication succeeded, but the user does not have permission/role to access the resource (Identity known, permission denied).

#### Q12: How does MongoDB store data?
> **Answer:** MongoDB stores data as BSON (Binary JSON) documents inside Collections within a Database. BSON extends JSON with additional data types like `ObjectId`, `Date`, and binary buffers.

#### Q13: Why should you use `.lean()` in Mongoose queries?
> **Answer:** `.lean()` instructs Mongoose to return plain JavaScript objects instead of full Mongoose Documents. This eliminates the overhead of getters, setters, and change tracking, speeding up read queries by up to 5x.

#### Q14: What is an index in MongoDB, and what are its trade-offs?
> **Answer:** An index is a specialized B-tree data structure that allows MongoDB to locate documents quickly without scanning every document in a collection (Collection Scan). Trade-off: Faster reads, but slightly slower writes/inserts and additional disk memory consumption.

#### Q15: What is the difference between Embedding and Referencing in MongoDB?
> **Answer:** Embedding stores subdocuments directly inside the parent document (1:1 or small 1:few relationships; best for fast atomic reads). Referencing stores the `ObjectId` of another document (1:many or many:many relationships; prevents document size exceeding the 16MB BSON limit).

#### Q16: How do you prevent SQL / NoSQL Injection in Node.js?
> **Answer:**
> 1. Use ORMs/ODMs (Mongoose, Sequelize) with schema validation.
> 2. Never pass unsanitized `req.body` or query strings directly into database selectors.
> 3. Cast and sanitize types (e.g. `String(req.body.id)`).

#### Q17: What is Password Salting and why is it important?
> **Answer:** A salt is a cryptographically random string generated per user and combined with their password before hashing. It ensures that two users with the same password have completely different hashes, neutralizing Rainbow Table attacks.

#### Q18: What is the purpose of `HttpOnly` and `SameSite` flags on cookies?
> **Answer:**
> - `HttpOnly`: Prevents client-side scripts from reading the cookie, stopping XSS token theft.
> - `SameSite=Lax/Strict`: Prevents browsers from sending the cookie in cross-site requests, mitigating CSRF attacks.

#### Q19: What is the difference between JWT and Session-based Authentication?
> **Answer:** Session authentication is stateful (stored in server database/Redis; instant revocation possible). JWT authentication is stateless (cryptographically signed JSON token validated by secret key; revocation requires token blacklists).

#### Q20: What is an Idempotency Key?
> **Answer:** A unique identifier generated by the client for an operation (like payment or booking). If the network drops and the client retries, the server checks the key and returns the original result without executing the charge or booking twice.

#### Q21: What is Rate Limiting and how does it protect an API?
> **Answer:** Rate limiting caps the number of requests an IP or user can make in a given time window. It protects APIs from brute-force password guessing, DoS attacks, and web scrapers.

#### Q22: What is the purpose of `express.json()` middleware?
> **Answer:** It parses incoming request payloads with `Content-Type: application/json` and populates `req.body` with the parsed JavaScript object.

#### Q23: What is a Memory Leak in Node.js and how do you prevent it?
> **Answer:** A memory leak occurs when memory allocated by V8 is not garbage collected because references are unintentionally retained (e.g., global variables, uncleared `setInterval`, growing in-memory caches, unremoved event listeners).

#### Q24: What is the difference between `cluster` module and Worker Threads in Node.js?
> **Answer:**
> - `cluster`: Spawns multiple OS processes running the same code, each with its own V8 instance and memory space, sharing a single server port (multi-process).
> - `worker_threads`: Spawns lightweight threads within the *same* process, sharing memory via `ArrayBuffer` (multi-threading for CPU tasks).

#### Q25: What is Graceful Shutdown and why is it required in production?
> **Answer:** Graceful shutdown is the process of stopping a Node.js server cleanly upon receiving OS termination signals (`SIGTERM`, `SIGINT`). It stops accepting new requests, finishes processing existing in-flight requests, closes database connections cleanly, and then exits.

---

## 💡 5. Universal AI Prompt

```text
Please build my Node.js backend using this standard Express MVC architecture:

Folder Structure:
server/
├── app.js                          # Express app & route mounting
├── server.js                       # DB connection (connectDB) & app.listen(PORT)
└── src/
    ├── config/db.js                # MongoDB connection
    ├── controllers/                # Async req, res controller functions
    ├── middlewares/                # Auth, role check, validator, error handler
    ├── models/                     # Mongoose models
    ├── routes/                     # Standard express.Router() files
    └── utils/                      # Formatters, pricing, validators

Rules:
1. Simple, clean, standard Express code without complex closures.
2. Route chaining: router.post('/path', auth, validate, controller).
3. Always use async/await with try/catch.
4. Return standard HTTP status codes (200, 201, 400, 401, 403, 404, 500).
5. Always validate and sanitize input payloads in dedicated validator middlewares.
```

# Finance Data Processing & Access Control Backend

A scalable, secure backend REST API for managing financial transactions. This system features robust Role-Based Access Control (RBAC), a comprehensive analytics dashboard powered by MongoDB aggregations, and automated API documentation.

## 🚀 Key Features

- **🔐 Secure Authentication & Authorization**
  - JWT-based authentication.
  - Secure password hashing using `bcrypt`.
  - Multi-tiered Role-Based Access Control (**Admin**, **Analyst**, **Viewer**).
- **👤 User Management**
  - Admin-exclusive routes to create, update, and manage users.
  - Soft-delete functionality (data is flagged as deleted but preserved for auditing).
  - Secure password resets and role modifications.
- **💳 Transaction Processing**
  - Full CRUD capabilities for income and expense transactions.
  - Advanced filtering (by type, category, and custom date ranges) with pagination.
- **📊 Advanced Analytics Dashboard**
  - Powered by efficient MongoDB Aggregation pipelines.
  - Generates real-time financial summaries: Total Income, Total Expense, and Net Balance.
  - Provides categorical breakdowns, monthly/weekly trends, and recent system activities.
- **📄 Interactive API Documentation**
  - Fully integrated Swagger UI for easy API testing and exploration.

---

## 🛠️ Tech Stack

- **Runtime Environment:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB
- **Authentication:** JSON Web Tokens (JWT)
- **Documentation:** Swagger (OpenAPI)

---

## 🚦 Rate Limiting

To protect the API from abuse and brute-force attacks, rate limiting is implemented using **express-rate-limit**.

---

### 🔹 Global API Limiter

Applied to all routes:

- **Limit:** 150 requests
- **Window:** 15 minutes per IP

```js
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
});
```

---

### 🔐 Auth Route Limiter (Strict)

Applied specifically to authentication routes (`/api/auth`):

- **Limit:** 20 requests
- **Window:** 15 minutes per IP
- Protects against brute-force login attacks

```js
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
});
```

---

### ⚙️ Additional Configurations

- `standardHeaders: true` → Sends rate limit info in headers
- `legacyHeaders: false` → Disables deprecated headers
- Custom error response:

```json
{
  "success": false,
  "message": "Too many requests, please try again later."
}
```

---

### 🛡️ Why Rate Limiting?

- Prevents API abuse
- Protects authentication endpoints
- Improves backend stability
- Enhances security against brute-force attacks

---

## 🧠 Assumptions

1. **Roles & Permissions**

   - Admin: Full access (create/update/delete users and transactions, view dashboard).
   - Analyst: Can view transactions and dashboard, but cannot create or update users or transactions.
   - Viewer: Read-only access to dashboard data.

2. **Transaction Ownership**

   - Every transaction is linked to the user who created it (`createdBy`).
   - Analysts can only view transactions created by their parent admin.
   - Admins can view their own transactions and those of their analysts.

3. **Soft Delete**

   - Users and transactions are never permanently deleted.
   - Deleted items are flagged (`isDeleted = true`) and hidden from API responses.
   - This ensures auditability and data integrity.

4. **Authentication**

   - JWT is used for authentication with a single token type (no refresh tokens).
   - All protected routes require `Authorization: Bearer <JWT>` header.

5. **Filtering & Pagination**

   - Transactions support filtering by type, category, date range, and pagination using `page` and `limit`.
   - Default page = 1, default limit = 10 if not provided.

6. **Data Visibility**

   - Dashboard summaries only show data visible to the logged-in user based on role and the data is from the admin who add / create the transactions.
   - Viewer sees aggregated totals, Analyst sees their admin’s data, Admin sees their own + their analysts’ data.

7. **Rate Limiting**

   - General API: 150 requests per 15 minutes.
   - Auth routes: 20 requests per 15 minutes to prevent brute-force attacks.

8. **Swagger Documentation**

   - All endpoints are fully documented and testable through `/api-docs`.

---

## ⚖️ Tradeoffs

1. **JWT Without Refresh Tokens**

   - Used simple JWT authentication without refresh tokens.
   - This keeps the implementation simple for the assignment.
   - In a production system, refresh tokens would be added for better security and session management.

2. **No Caching Layer**

   - Dashboard aggregation queries run directly on MongoDB.
   - This is sufficient for small to medium datasets.
   - In a real system, caching (e.g., Redis) would be used to improve performance.

3. **Limited Validation Layer**

   - Validation is handled manually inside controllers.
   - This keeps the code simple and readable.

4. **No Unit or Integration Tests**

   - As off now I am no familiar as much with Testing.
   - In a real-world system, automated testing would be essential for reliability.

5. **Single Service Architecture**

   - The project is built as a monolithic backend.
   - This is easier to manage for small applications.
   - For large-scale systems, microservices or modular services could be used.

6. **Basic Error Handling**

   - Errors are handled at the controller level.
   - A centralized error-handling middleware would improve consistency in larger systems.

   ***

## Hosted Backend URL - Render

```bash
https://zorvyn-backend-taks.onrender.com/api-docs
```

## ⚙️ Local Installation & Setup

Follow these steps to run the project locally on your machine.

### 1. Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas URI)

### 2. Clone the Repository

```bash
git clone https://github.com/GadeArjun/zorvyn_backend_taks.git
cd zorvyn_backend_taks
```

### 3\. Install Dependencies

```bash
npm install
```

### 4\. Setup Environment Variables

Create a `.env` file in the root directory of the project and add the following variables:

```env
PORT=8080
MONGO_URI=your_mongodb_connection_string_here
JWT_KEY=your_super_secret_jwt_key_here
```

### 5\. Start the Server

For development (with auto-reload):

```bash
npm run dev
```

For production:

```bash
npm start
```

_The server should now be running on `http://localhost:8080`._

---

## 📖 API Documentation

Once the server is running, you can explore all available endpoints and test them directly from your browser using the Swagger UI interface:

🔗 **[http://localhost:8080/api-docs](https://www.google.com/search?q=http://localhost:8080/api-docs)**

---

## 🔑 Complete API Usage Guide (Step-by-Step - Based on Actual Implementation)

This guide reflects the **exact backend behavior, routes, and logic** implemented in the system.

---

# 🧩 STEP 1: Create First Admin (System Bootstrap)

> ⚠️ Public route (NO token required)

### ➤ Endpoint

```
POST /api/auth/create/admin
```

### ➤ Request Body

```json
{
  "name": "Admin",
  "email": "admin@example.com",
  "password": "Admin@123"
}
```

### 🔍 Validations

- All fields required
- Email format validated
- Password strength validated
- Email must be unique

### ➤ Success Response

```json
{
  "success": true,
  "message": "User create successfully. Login to access dashboard.",
  "user": { ... }
}
```

---

# 🔐 STEP 2: Login

### ➤ Endpoint

```
POST /api/auth/login
```

### ➤ Request Body

```json
{
  "email": "admin@example.com",
  "password": "Admin@123"
}
```

### 🔍 Logic

- Checks `email + isDeleted: false`
- Verifies password using bcrypt
- Generates JWT token

### ➤ Success Response

```json
{
  "success": true,
  "message": "Login successfully!",
  "token": "JWT_TOKEN",
  "user": { ... }
}
```

---

# 🔑 STEP 3: Use Token

Add header in ALL protected routes:

```
Authorization: Bearer <JWT_TOKEN>
```

---

# 👤 STEP 4: User Management (ADMIN ONLY)

---

## ➤ Create User

```
POST /api/auth/create/user
```

### Headers:

- Authorization required
- Role: `admin`

### Body:

```json
{
  "name": "Analyst",
  "email": "analyst@example.com",
  "password": "User@123",
  "role": "analyst"
}
```

### 🔍 Logic

- Validates email & password
- Checks duplicate email
- Sets `createdBy = adminId`

---

## ➤ Update User

```
POST /api/user/update/:userId
```

### Body:

```json
{
  "name": "Updated Name",
  "email": "new@email.com"
}
```

---

## ➤ Change Role

```
POST /api/user/role/:userId
```

### Body:

```json
{
  "role": "viewer"
}
```

### Allowed Roles:

- admin
- analyst
- viewer

---

## ➤ Reset Password

```
POST /api/user/reset-password/admin/:userId
```

### Body:

```json
{
  "newPassword": "NewPass@123"
}
```

---

## ➤ Soft Delete User

```
DELETE /api/user/delete/:userId
```

### 🔍 Logic

- Sets:

  - `isDeleted = true`
  - `isActive = false`

---

# 💳 STEP 5: Transaction Management

---

## ➤ Create Transaction

```
POST /api/transaction
```

### Role:

- Admin only

### Body:

```json
{
  "amount": 1000,
  "type": "income",
  "category": "Salary",
  "note": "Monthly salary",
  "transaction_date": "2026-04-01"
}
```

### 🔍 Logic

- Requires `amount` and `type`
- Automatically sets `createdBy`
- Creates RecentActivity log

---

## ➤ Get Transactions (FILTER + PAGINATION)

```
GET /api/transaction
```

### Roles:

- Admin
- Analyst

### Query Params:

```
?page=1
&limit=10
&type=income
&category=Salary
&startDate=2026-01-01
&endDate=2026-12-31
```

---

### 🔍 Important Logic (VERY IMPORTANT)

#### ADMIN:

- Can see:

  - Their own transactions
  - Parent admin transactions (if exists)

#### ANALYST:

- Can ONLY see:

  - Transactions created by their admin (`createdBy`)

---

### ➤ Response

```json
{
  "success": true,
  "total": 25,
  "page": 1,
  "data": [ ... ]
}
```

---

## ➤ Get Single Transaction

```
GET /api/transaction/:id
```

### 🔍 Logic:

- Validates ObjectId
- Checks `isDeleted = false`

---

## ➤ Update Transaction

```
POST /api/transaction/update/:id
```

### Role:

- Admin

### 🔍 Critical Logic:

- Only **creator** can update

```js
transaction.createdBy === req.user._id;
```

---

## ➤ Delete Transaction (Soft Delete)

```
DELETE /api/transaction/delete/:id
```

### 🔍 Logic:

- Only creator allowed
- Sets:

```js
isDeleted = true;
```

- Logs RecentActivity

---

# 📊 STEP 6: Dashboard Summary (Advanced Aggregation)

```
GET /api/transaction/dashboard/summary
```

### Roles:

- Admin
- Analyst
- Viewer

---

## 🔍 Data Visibility Logic

### ADMIN:

- Own + parent data

### ANALYST / VIEWER:

- Only admin's data (`createdBy`)

---

## ➤ Response Structure

```json
{
  "success": true,
  "data": {
    "totalIncome": 50000,
    "totalExpense": 20000,
    "netBalance": 30000,
    "categoryBreakdown": [],
    "monthlyTrends": [],
    "weeklyTrends": [],
    "recentTransactions": [],
    "recentActivity": []
  }
}
```

---

## 📊 Aggregations Used

### 1. Totals

- Group by `type` → income / expense

### 2. Category Breakdown

- Group by:

```js
{
  category, type;
}
```

### 3. Monthly Trends

- Group by:

```js
{
  month, year, type;
}
```

### 4. Weekly Trends

- Current month only
- Uses `$isoWeek`

### 5. Recent Transactions

- Last 5 records

### 6. Recent Activity

- Last 5 logs

---

# 🔒 Role-Based Access Summary

| Feature            | Admin | Analyst | Viewer |
| ------------------ | ----- | ------- | ------ |
| Create User        | ✅    | ❌      | ❌     |
| Manage Users       | ✅    | ❌      | ❌     |
| Create Transaction | ✅    | ❌      | ❌     |
| View Transactions  | ✅    | ✅      | ❌     |
| Dashboard          | ✅    | ✅      | ✅     |

---

# ⚠️ Important Edge Cases

- Invalid ObjectId → 400 error
- Deleted user → cannot login
- Deleted transaction → not visible
- Unauthorized update/delete → 403 error
- Missing fields → validation error

---

# 🧪 Recommended Testing Flow

1. Create Admin
2. Login → Get Token
3. Create Analyst
4. Create Transactions
5. Fetch transactions with filters
6. Update/Delete transactions
7. Check dashboard summary

---

# 🚨 Notes (Based on Code)

- All deletes are **soft delete**
- Activity logging is implemented
- RBAC is strictly enforced
- Data visibility depends on `createdBy`

---

## 📦 Detailed Folder Structure

The project follows a **modular MVC (Model-View-Controller) architecture** with clear separation of concerns for scalability and maintainability.

```text
├── config/
│   ├── db.js                  # MongoDB connection setup using Mongoose
│   └── swagger.js             # Swagger (OpenAPI) configuration for API docs
│
├── controllers/
│   ├── auth.controller.js     # Authentication logic (admin creation, login, user creation)
│   ├── user.controller.js     # User management (update, delete, role change, password reset)
│   └── transaction.controller.js  # Transaction CRUD + advanced analytics (dashboard)
│
├── middleware/
│   └── auth.middleware.js     # JWT verification (protect) + Role-based access control (authorizeRole)
│
├── models/
│   ├── User.js                # User schema (RBAC, soft delete, createdBy relation)
│   ├── Transaction.js         # Transaction schema (income/expense records)
│   └── RecentActivity.js      # Activity logging schema (audit trail)
│
├── routes/
│   ├── auth.routes.js         # Auth routes (create admin, login, create user)
│   ├── user.routes.js         # User routes (admin-only operations)
│   └── transaction.routes.js  # Transaction routes + dashboard summary
│
├── utils/
│   └── auth.utils.js          # Utility functions:
│                              # - Password hashing (bcrypt)
│                              # - Token generation (JWT)
│                              # - Email & password validation
│
├── index.js                   # Application entry point:
│                              # - Express app setup
│                              # - Middleware configuration
│                              # - Route mounting
│                              # - Swagger integration
│                              # - Server initialization
│
├── .env                       # Environment variables (PORT, MONGO_URI, JWT_KEY)
├── .env.example                      # Environment variables example file (PORT, MONGO_URI, JWT_KEY)
├── package.json               # Project dependencies and scripts
└── package-lock.json          # Dependency lock file
```

---

## 🧠 Architecture Overview

### 🔹 MVC Pattern Used

- **Models** → Database structure (MongoDB schemas)
- **Controllers** → Business logic & request handling
- **Routes** → API endpoint definitions
- **Middleware** → Authentication & authorization layer
- **Utils** → Reusable helper functions

---

## 🔄 Request Flow

```text
Client Request
     ↓
Route (routes/)
     ↓
Middleware (auth + RBAC)
     ↓
Controller (business logic)
     ↓
Model (DB interaction)
     ↓
Response
```

---

## 🔐 Key Design Decisions

- **RBAC (Role-Based Access Control)** enforced via middleware
- **Soft Deletes** used instead of permanent deletion (`isDeleted`)
- **Activity Logging** using `RecentActivity` model
- **Aggregation Pipelines** used for dashboard analytics
- **Modular Structure** for scalability and maintainability

---

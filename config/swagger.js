const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Expense Tracker API",
      version: "1.0.0",
      description: `
🚀 Expense Tracker API Documentation

👉 Flow to use APIs:

1. 🔐 Login using /api/auth/login
2. Copy JWT token
3. Click 🔒 Authorize
4. Enter: Bearer YOUR_TOKEN
5. Access protected APIs

📊 Modules:
- Auth → Login & User Creation
- User → Manage users (Admin only)
- Transaction → Financial data & dashboard
      `,
    },

    servers: [
      {
        url: "https://zorvyn-backend-taks.onrender.com",
        description: "Hosted render's server",
      },
      {
        url: "http://localhost:8080",
        description: "Local Development Server",
      },
      {
        url: "https://8080-firebase-zorvynbackendtask-1775105333894.cluster-yylgzpipxrar4v4a72liastuqy.cloudworkstations.dev",
        description: "Cloud Server",
      },
    ],

    // ✅ ORDER CONTROL HERE
    tags: [
      { name: "Auth", description: "Authentication APIs" },
      { name: "User", description: "User Management APIs (Admin only)" },
      { name: "Transaction", description: "Transaction & Dashboard APIs" },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: `
Enter JWT token in format:

Bearer <your_token>

Example:
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
          `,
        },
      },

      // 🔥 OPTIONAL (but recommended schemas)
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            email: { type: "string" },
            role: {
              type: "string",
              enum: ["admin", "analyst", "viewer"],
            },
          },
        },

        Transaction: {
          type: "object",
          properties: {
            _id: { type: "string" },
            amount: { type: "number" },
            type: {
              type: "string",
              enum: ["income", "expense"],
            },
            category: { type: "string" },
            note: { type: "string" },
            transaction_date: { type: "string", format: "date" },
          },
        },
      },
    },

    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  // ✅ CONTROL FILE ORDER (important)
  apis: [
    "./routes/auth.routes.js",
    "./routes/user.routes.js",
    "./routes/transaction.routes.js",
  ],
};

const swaggerSpec = swaggerJsdoc(options);

exports.swaggerSpec = swaggerSpec;

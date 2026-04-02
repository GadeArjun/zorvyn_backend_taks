const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Expense Tracker API",
      version: "1.0.0",
      description: "API documentation for Expense Tracker",
    },
    servers: [
      {
        url: "https://8080-firebase-zorvynbackendtask-1775105333894.cluster-yylgzpipxrar4v4a72liastuqy.cloudworkstations.dev",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js"], // scan routes
};

const swaggerSpec = swaggerJsdoc(options);

exports.swaggerSpec = swaggerSpec;

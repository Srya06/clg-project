import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Code-D-B API Documentation',
      version: '1.0.0',
      description:
        'API documentation for the AI-Based Student Performance Analysis System Backend',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.ts', './src/routes/*.js'],
};

const specs = swaggerJsDoc(options);

const swaggerSetup = (app: Express): void => {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));
};

export default swaggerSetup;

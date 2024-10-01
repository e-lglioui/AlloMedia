import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Définir les options pour Swagger
const options = {
  definition: {
    openapi: '3.0.0', // Utilise OpenAPI version 3
    info: {
      title: 'API Documentation', // Titre de la documentation
      version: '1.0.0', // Version de l'API
      description: 'API documentation for your project' // Description de l'API
    },
    servers: [
      {
        url: 'http://localhost:3000', // URL de l'API
        description: 'Development server'
      }
    ],
  },
  apis: ['./routes/*.js'], // Les fichiers contenant des annotations Swagger
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = (app) => {
  // Route pour accéder à la documentation Swagger
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

module.exports = setupSwagger;

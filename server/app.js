import express from 'express';
import dotenv from 'dotenv'; // Importer dotenv
import db from './config/db.js'; // Assurez-vous que le chemin est correct
import authRouter from './routes/authRoutes.js'; 
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';
dotenv.config();
const app = express();
const port = 3000;
db();



// Middleware pour parser le JSON
app.use(express.json());
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AlloMedia API',
      version: '1.0.0',
      description: 'API documentation for AlloMedia',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['./routes/*.js'], 
};
app.use(cors({ origin: 'http://localhost:5173' }));

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next(); // 
});

// Utiliser le routeur d'authentification
app.use(authRouter);


// Route de base
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

export default app;
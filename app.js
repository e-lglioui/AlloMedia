import express from 'express';
import dotenv from 'dotenv'; // Importer dotenv
import db from './config/db.js'; // Assurez-vous que le chemin est correct
import authRouter from './routes/authRoutes.js'; 
dotenv.config();
const app = express();
const port = 3000;
db();


// Middleware pour parser le JSON
app.use(express.json());

// Ajoutez un middleware pour loguer les requêtes
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next(); // Passe à la prochaine middleware ou route
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

const express = require('express');
const app = express();
const port = 3000;
const db = require('./config/db');

db();

const authRouter = require('./routes/authRoutes');

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

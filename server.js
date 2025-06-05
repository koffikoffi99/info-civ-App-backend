require('dotenv').config();
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./database/db');

// Routes
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');

// Charger les variables d'environnement
dotenv.config({ path: './.env' });

// Connecter à la base de données
connectDB();

const app = express();

// Middleware
app.use(express.json()); // Parser le corps des requêtes JSON
app.use(cors()); // Activer CORS pour toutes les origines (pour le développement)

// Monter les routeurs
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Serveur Express démarré sur le port ${PORT}`);
});
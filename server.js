require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./database/db');

// Routes
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');

// Charger les variables d'environnement
require('dotenv').config({ path: './.env' });

// Connecter à la base de données
connectDB();

const app = express();

// Configuration CORS avec liste blanche
const allowedOrigins = [
    'http://localhost:5173', // pour le développement local
    'https://mellow-salamander-74a33b.netlify.app' // pour le site en production
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json()); // Parser le corps des requêtes JSON

// Monter les routeurs
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Serveur Express démarré sur le port ${PORT}`);
});

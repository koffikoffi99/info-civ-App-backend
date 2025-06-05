const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Route pour l'enregistrement d'un nouvel utilisateur
router.post('/register', registerUser);
// Route pour la connexion d'un utilisateur
router.post('/login', loginUser);
// Route pour obtenir les données de l'utilisateur connecté (protégée)
router.get('/me', protect, getMe);

module.exports = router;
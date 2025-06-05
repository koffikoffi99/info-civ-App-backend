const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Générer un token JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Le token expire après 30 jours
    });
};


const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Veuillez entrer tous les champs' });
    }

    // Vérifier si l'utilisateur existe déjà
    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: 'L\'utilisateur existe déjà avec cet email' });
    }

    // Créer l'utilisateur
    const user = await User.create({
        name,
        email,
        password,
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: 'Données utilisateur invalides' });
    }
};


const loginUser = async (req, res) => {
    const { email, password } = req.body;

    // Vérifier l'email de l'utilisateur
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'Email ou mot de passe invalide' });
    }
};


const getMe = async (req, res) => {
    // req.user est défini par le middleware protect
    res.status(200).json({
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
    });
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
};
const express = require('express');
const router = express.Router();
const { getPosts, getPostById, createPost, updatePost, deletePost } = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer'); // Pour gérer les uploads de fichiers

// Configurer Multer pour stocker les fichiers en mémoire (buffer)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.route('/')
    .get(getPosts) // Obtenir tous les posts
    .post(protect, upload.single('image'), createPost); // Créer un post, avec upload d'une seule image nommée 'image'

router.route('/:id')
    .get(getPostById) // Obtenir un post par ID
    .put(protect, upload.single('image'), updatePost) // Mettre à jour un post, avec upload d'une seule image
    .delete(protect, deletePost); // Supprimer un post

module.exports = router;
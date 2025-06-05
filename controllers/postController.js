const Post = require('../models/Post');

const DatauriParser = require('datauri/parser');
const path = require('path');
const cloudinary = require('../config/cloudinary');



cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


const parser = new DatauriParser();
const formatBufferToDataUri = (fileBuffer, mimeType) => parser.format(path.extname(`file.${mimeType.split('/')[1]}`).toString(), fileBuffer);


const getPosts = async (req, res) => {
    try {
        const { category, search } = req.query;
        let query = {};

        if (category) {
            query.category = category;
        }
        if (search) {

            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } },
            ];
        }


        const posts = await Post.find(query).populate('author', 'name email').sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (error) {
        console.error('Erreur lors de la récupération des posts:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la récupération des posts', error: error.message });
    }
};


const getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('author', 'name email');
        if (!post) {
            return res.status(404).json({ message: 'Post non trouvé' });
        }
        res.status(200).json(post);
    } catch (error) {
        console.error('Erreur lors de la récupération du post par ID:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la récupération du post', error: error.message });
    }
};


const createPost = async (req, res) => {
    try {

        const { title, category, location, description } = req.body;

        if (!title || !category || !location || !description) {
            return res.status(400).json({ message: 'Veuillez remplir tous les champs obligatoires' });
        }

        let photoUrl = null;
        if (req.file) {
            const fileBuffer = req.file.buffer;
            const mimeType = req.file.mimetype;

            const dataUri = formatBufferToDataUri(fileBuffer, mimeType);
            const uploadResult = await cloudinary.uploader.upload(dataUri.content, {
                folder: 'infociv_posts',
                resource_type: 'image'
            });
            photoUrl = uploadResult.secure_url;
        }

        const post = await Post.create({
            title,
            category,
            location,
            photo: photoUrl,
            description,
            author: req.user.id,
        });

        res.status(201).json(post);
    } catch (error) {
        console.error('Erreur lors de la création du post:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la création du post', error: error.message });
    }
};

const updatePost = async (req, res) => {
    try {
        const { title, category, location, description } = req.body;
        let post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post non trouvé' });
        }


        if (post.author.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Non autorisé à modifier ce post' });
        }

        let photoUrl = post.photo;

        if (req.file) {
            const fileBuffer = req.file.buffer;
            const mimeType = req.file.mimetype;
            const dataUri = formatBufferToDataUri(fileBuffer, mimeType);
            const uploadResult = await cloudinary.uploader.upload(dataUri.content, {
                folder: 'infociv_posts',
                resource_type: 'image'
            });
            photoUrl = uploadResult.secure_url;

            if (post.photo) {
                const publicId = post.photo.split('/').pop().split('.')[0];

            }
        } else if (req.body.photo === '') {
            photoUrl = null;
            if (post.photo) {
                const publicId = post.photo.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`infociv_posts/${publicId}`);
            }
        }


        const updatedPost = await Post.findByIdAndUpdate(
            req.params.id,
            { title, category, location, photo: photoUrl, description },
            { new: true, runValidators: true }
        );

        res.status(200).json(updatedPost);
    } catch (error) {
        console.error('Erreur lors de la mise à jour du post:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la mise à jour du post', error: error.message });
    }
};


const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post non trouvé' });
        }


        if (post.author.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Non autorisé à supprimer ce post' });
        }


        if (post.photo) {
            const publicId = post.photo.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`infociv_posts/${publicId}`);
        }

        await post.deleteOne();

        res.status(200).json({ message: 'Post supprimé avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression du post:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la suppression du post', error: error.message });
    }
};

module.exports = {
    getPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost,
};
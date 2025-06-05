const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            enum: ['Tourisme', 'Santé', 'Astuces', 'Loisirs'],
            required: true,
        },
        location: {
            type: String,
            required: true,
        },
        photo: {
            type: String,
        },
        description: {
            type: String,
            required: true,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Post', PostSchema);
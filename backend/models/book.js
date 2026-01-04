const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    author: {
        type: String,
        required: [true, 'Author is required'],
        trim: true
    },
    isbn: {
        type: String,
        required: [true, 'ISBN is required'],
        unique: true,
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 'Biography', 'Other']
    },
    publicationYear: {
        type: Number,
        required: [true, 'Publication year is required'],
        min: [1000, 'Publication year must be valid'],
        max: [new Date().getFullYear(), 'Publication year cannot be in the future']
    },
    availableCopies: {
        type: Number,
        required: [true, 'Available copies is required'],
        min: [0, 'Available copies cannot be negative'],
        default: 1
    }
}, {
    timestamps: true
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
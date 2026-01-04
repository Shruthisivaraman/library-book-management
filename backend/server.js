const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const Book = require('./models/book');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/library_db')
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// GET ALL BOOKS with filtering
// CREATE (POST) a new book
app.post('/api/books', async (req, res) => {
  try {
    const book = new Book(req.body);
    await book.save();
    res.status(201).json(book);
  } catch (error) {
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.errors 
      });
    }
    
    // Handle duplicate ISBN or other errors
    if (error.code === 11000) { // MongoDB duplicate key error
      return res.status(400).json({ 
        error: 'Duplicate value',
        field: Object.keys(error.keyPattern)[0]
      });
    }
    
    console.error('Error creating book:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT - Update a book
app.put('/api/books/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid book ID' });
    }
    
    // Update the book
    const updatedBook = await Book.findByIdAndUpdate(
      id,
      req.body,
      { 
        new: true,           // Return updated document
        runValidators: true  // Validate the update
      }
    );
    
    // Check if book exists
    if (!updatedBook) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    res.json(updatedBook);
    
  } catch (error) {
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.errors 
      });
    }
    
    console.error('PUT error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/books', async (req, res) => {
  try {
    const { title, author, genre } = req.query;
    const filter = {};
    
    if (title) filter.title = new RegExp(title, 'i');
    if (author) filter.author = new RegExp(author, 'i');
    if (genre) filter.genre = genre;
    
    const books = await Book.find(filter);
    res.json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET SINGLE BOOK by ID
app.get('/api/books/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid book ID' });
    }
    
    const book = await Book.findById(id);
    
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    res.json(book);
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ ADD THIS ROUTE or UPDATE EXISTING ONE:
app.patch('/api/books/:id/decrement', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid book ID' });
    }
    
    // ✅ FIRST: FIND THE BOOK
    const book = await Book.findById(id);
    
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    // ✅ CHECK: PREVENT NEGATIVE STOCK
    if (book.availableCopies <= 0) {
      return res.status(400).json({ 
        error: 'No copies available to borrow',
        currentCopies: book.availableCopies 
      });
    }
    
    // ✅ ONLY DECREMENT IF COPIES > 0
    const updatedBook = await Book.findByIdAndUpdate(
      id,
      { $inc: { availableCopies: -1 } },
      { new: true }
    );
    
    res.json(updatedBook);
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Available routes:');
  console.log('  GET /api/books');
  console.log('  GET /api/books/:id');
});
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:5000/api/books';

function App() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [currentBook, setCurrentBook] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [minYear, setMinYear] = useState('');
    const [maxYear, setMaxYear] = useState('');
    
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        isbn: '',
        category: 'Fiction',
        publicationYear: new Date().getFullYear(),
        availableCopies: 1
    });

    const categories = ['Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 'Biography', 'Other'];

    // Fetch books on component mount
    useEffect(() => {
        fetchBooks();
    }, []);

    // Fetch books based on filters
    const fetchBooks = async () => {
        try {
            setLoading(true);
            setError('');
            
            let url = API_URL;
            const params = new URLSearchParams();
            
            if (selectedCategory) {
                params.append('category', selectedCategory);
            }
            if (minYear) {
                params.append('minYear', minYear);
            }
            if (maxYear) {
                params.append('maxYear', maxYear);
            }
            
            const queryString = params.toString();
            if (queryString) {
                url = `${API_URL}?${queryString}`;
            }
            
            const response = await axios.get(url);
            setBooks(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch books');
        } finally {
            setLoading(false);
        }
    };

    // Refetch when filters change
    useEffect(() => {
        fetchBooks();
    }, [selectedCategory, minYear, maxYear]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'publicationYear' || name === 'availableCopies' 
                ? Number(value) 
                : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            if (isEditing) {
                const response = await axios.put(`${API_URL}/${currentBook._id}`, formData);
                setSuccess(response.data.message);
            } else {
                const response = await axios.post(API_URL, formData);
                setSuccess(response.data.message);
            }
            fetchBooks();
            resetForm();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleEdit = (book) => {
        setIsEditing(true);
        setCurrentBook(book);
        setFormData({
            title: book.title,
            author: book.author,
            isbn: book.isbn,
            category: book.category,
            publicationYear: book.publicationYear,
            availableCopies: book.availableCopies
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this book?')) return;
        
        try {
            setError('');
            const response = await axios.delete(`${API_URL}/${id}`);
            setSuccess(response.data.message);
            fetchBooks();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete book');
        }
    };

    const resetForm = () => {
        setIsEditing(false);
        setCurrentBook(null);
        setFormData({
            title: '',
            author: '',
            isbn: '',
            category: 'Fiction',
            publicationYear: new Date().getFullYear(),
            availableCopies: 1
        });
    };

    const clearFilters = () => {
        setSelectedCategory('');
        setMinYear('');
        setMaxYear('');
    };

    const closeAlert = () => {
        setError('');
        setSuccess('');
    };

    return (
        <div className="container">
            <header>
                <h1>📚 Library Book Management</h1>
            </header>

            {error && (
                <div className="alert alert-error">
                    <span>{error}</span>
                    <button onClick={closeAlert} className="alert-close">×</button>
                </div>
            )}

            {success && (
                <div className="alert alert-success">
                    <span>{success}</span>
                    <button onClick={closeAlert} className="alert-close">×</button>
                </div>
            )}

            {/* Add/Edit Book Form */}
            <div className="card">
                <h2>{isEditing ? 'Edit Book' : 'Add New Book'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Title *</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                required
                                placeholder="Enter book title"
                            />
                        </div>

                        <div className="form-group">
                            <label>Author *</label>
                            <input
                                type="text"
                                name="author"
                                value={formData.author}
                                onChange={handleInputChange}
                                required
                                placeholder="Enter author name"
                            />
                        </div>

                        <div className="form-group">
                            <label>ISBN *</label>
                            <input
                                type="text"
                                name="isbn"
                                value={formData.isbn}
                                onChange={handleInputChange}
                                required
                                placeholder="Enter ISBN"
                            />
                        </div>

                        <div className="form-group">
                            <label>Category *</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                required
                            >
                                {categories.map(category => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Publication Year *</label>
                            <input
                                type="number"
                                name="publicationYear"
                                value={formData.publicationYear}
                                onChange={handleInputChange}
                                required
                                min="1000"
                                max={new Date().getFullYear()}
                            />
                        </div>

                        <div className="form-group">
                            <label>Available Copies *</label>
                            <input
                                type="number"
                                name="availableCopies"
                                value={formData.availableCopies}
                                onChange={handleInputChange}
                                required
                                min="0"
                            />
                        </div>
                    </div>

                    <div className="button-group">
                        <button type="submit" className="btn btn-primary">
                            {isEditing ? 'Update Book' : 'Add Book'}
                        </button>
                        <button 
                            type="button" 
                            onClick={resetForm} 
                            className="btn btn-secondary"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>

            {/* Filter Section with Quick Filters */}
            <div className="card">
                <h2>Filter Books</h2>
                <div className="filter-section">
                    <div className="filter-grid">
                        <div className="filter-group">
                            <label>Category</label>
                            <select 
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="filter-select"
                            >
                                <option value="">All Categories</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>From Year</label>
                            <input
                                type="number"
                                value={minYear}
                                onChange={(e) => setMinYear(e.target.value)}
                                placeholder="Min year"
                                min="1000"
                                max={new Date().getFullYear()}
                                className="filter-input"
                            />
                        </div>

                        <div className="filter-group">
                            <label>To Year</label>
                            <input
                                type="number"
                                value={maxYear}
                                onChange={(e) => setMaxYear(e.target.value)}
                                placeholder="Max year"
                                min="1000"
                                max={new Date().getFullYear()}
                                className="filter-input"
                            />
                        </div>
                    </div>
                    
                    {/* Quick Filter Buttons */}
                    <div className="quick-filters">
                        <button 
                            className={`quick-filter-btn ${minYear === '2016' && maxYear === '' ? 'active' : ''}`}
                            onClick={() => { setMinYear('2016'); setMaxYear(''); }}
                        >
                            Books after 2015
                        </button>
                        <button 
                            className={`quick-filter-btn ${minYear === '2010' && maxYear === '2020' ? 'active' : ''}`}
                            onClick={() => { setMinYear('2010'); setMaxYear('2020'); }}
                        >
                            2010-2020
                        </button>
                        <button 
                            className={`quick-filter-btn ${minYear === '2000' && maxYear === '2010' ? 'active' : ''}`}
                            onClick={() => { setMinYear('2000'); setMaxYear('2010'); }}
                        >
                            2000-2010
                        </button>
                        <button 
                            className={`quick-filter-btn ${minYear === '1900' && maxYear === '1950' ? 'active' : ''}`}
                            onClick={() => { setMinYear('1900'); setMaxYear('1950'); }}
                        >
                            Before 1950
                        </button>
                    </div>
                    
                    {(selectedCategory || minYear || maxYear) && (
                        <div className="filter-info">
                            <div className="active-filters">
                                {selectedCategory && (
                                    <span className="filter-tag">Category: {selectedCategory}</span>
                                )}
                                {minYear && (
                                    <span className="filter-tag">From: {minYear}</span>
                                )}
                                {maxYear && (
                                    <span className="filter-tag">To: {maxYear}</span>
                                )}
                            </div>
                            <button onClick={clearFilters} className="btn btn-sm btn-secondary">
                                Clear All Filters
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="card">
                <h2>
                    Book Collection 
                    <span className="book-count">
                        ({books.length} books)
                    </span>
                </h2>
                
                {loading ? (
                    <div className="loading">
                        <p>Loading books...</p>
                    </div>
                ) : books.length === 0 ? (
                    <div className="empty-state">
                        {selectedCategory || minYear || maxYear ? (
                            <div>
                                <p>No books found with current filters.</p>
                                <button onClick={clearFilters} className="btn btn-primary">
                                    Clear Filters
                                </button>
                            </div>
                        ) : (
                            <p>No books found. Add some books to get started!</p>
                        )}
                    </div>
                ) : (
                    <div className="books-grid">
                        {books.map(book => (
                            <div key={book._id} className="book-card">
                                <div className="book-category-badge">{book.category}</div>
                                <div className="book-year-badge">{book.publicationYear}</div>
                                <h3 className="book-title">{book.title}</h3>
                                <p className="book-author">by {book.author}</p>
                                <p><strong>ISBN:</strong> {book.isbn}</p>
                                <p><strong>Available:</strong> {book.availableCopies} copies</p>
                                
                                <div className="card-actions">
                                    <button 
                                        onClick={() => handleEdit(book)} 
                                        className="btn btn-sm btn-secondary"
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(book._id)} 
                                        className="btn btn-sm btn-danger"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
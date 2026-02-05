const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

// Register a new user
public_users.post('/register', function (req, res) {
    const username = req.body.username;
    const password = req.body.password;

    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!isValid(username)) {
            // Add the new user to the users array
            users.push({ "username": username, "password": password });
            return res.status(200).json({ message: "User successfully registered. Now you can login" });
        } else {
            return res.status(404).json({ message: "User already exists!" });
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({ message: "Unable to register user." });
});


// ---------------------
// Task 10: Get all books
// ---------------------
public_users.get('/', async (req, res) => {
    try {
        // Make an Axios GET request to fetch all books.
        // Since we don't have an external API, fallback to local `books` object.
        const response = await axios
            .get('http://localhost:5000/booksdb.json')
            .catch(() => ({ data: books })); // fallback if Axios call fails

        // Return the list of books as JSON
        return res.status(200).json(response.data);
    } catch (err) {
        // Handle errors gracefully
        return res.status(500).json({ 
            message: "Error fetching books", 
            error: err.message 
        });
    }
});

// ---------------------
// Task 11: Get book details by ISBN
// ---------------------
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    // Wrap the logic in a Promise
    new Promise((resolve, reject) => {
        // Check if the book exists
        if (books[isbn]) {
            // Resolve with a book object including isbn, author, title, and reviews
            resolve({
                isbn,
                author: books[isbn].author,
                title: books[isbn].title,
                reviews: books[isbn].reviews
            });
        } else {
            // Reject if book not found
            reject(new Error("Book not found"));
        }
    })
    .then(book => res.status(200).json(book)) // Send successful response
    .catch(err => res.status(404).json({ message: err.message })); // Send error if rejected
});


// ---------------------
// Task 12: Get all books by author
// ---------------------
public_users.get('/author/:author', function (req, res) {
    const authorName = req.params.author.toLowerCase();

    new Promise((resolve, reject) => {
        // Filter books matching the author name (case-insensitive)
        const matchingBooks = Object.keys(books)
            .filter(isbn => books[isbn].author.toLowerCase() === authorName)
            .map(isbn => ({
                isbn,
                author: books[isbn].author,
                title: books[isbn].title,
                reviews: books[isbn].reviews
            }));

        // Check if any books matched
        if (matchingBooks.length > 0) {
            resolve(matchingBooks);
        } else {
            reject(new Error("No books found for the given author"));
        }
    })
    .then(books => res.status(200).json(books)) // Send successful response
    .catch(err => res.status(404).json({ message: err.message })); // Send error if no matches
});

// ---------------------
// Task 13: Get all books by title
// ---------------------
public_users.get('/title/:title', function (req, res) {
    const bookTitle = req.params.title.toLowerCase();

    new Promise((resolve, reject) => {
        // Filter books matching the title (case-insensitive)
        const matchingBooks = Object.keys(books)
            .filter(isbn => books[isbn].title.toLowerCase() === bookTitle)
            .map(isbn => ({
                isbn,
                author: books[isbn].author,
                title: books[isbn].title,
                reviews: books[isbn].reviews
            }));

        // Check if any books matched
        if (matchingBooks.length > 0) {
            resolve(matchingBooks);
        } else {
            reject(new Error("No books found for the given title"));
        }
    })
    .then(books => res.status(200).json(books)) // Send successful response
    .catch(err => res.status(404).json({ message: err.message })); // Send error if no matches
});



// ---------------------
// Get book reviews by ISBN
// ---------------------
public_users.get('/review/:isbn', async (req, res) => {
    const isbn = req.params.isbn; // Extract ISBN from URL

    try {
        // Check if book exists
        if (!books[isbn]) {
            return res.status(404).json({ message: "Book not found" });
        }

        const reviews = books[isbn].reviews;

        // If no reviews exist, return a clear message
        if (Object.keys(reviews).length === 0) {
            return res.status(200).json({ message: "No reviews available for this book." });
        }

        // If reviews exist, return them
        return res.status(200).json(reviews);
    } catch (err) {
        // Handle unexpected errors
        return res.status(500).json({ 
            message: "Error fetching book reviews", 
            error: err.message 
        });
    }
});


module.exports.general = public_users;

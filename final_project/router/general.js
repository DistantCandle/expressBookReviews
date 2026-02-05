const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


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


// Get the book list available in the shop
public_users.get('/', function (req, res) {
    // Build array of key:value strings
    const entries = Object.entries(books).map(
        ([key, value]) => `"${key}":${JSON.stringify(value)}`
    );

    // Join entries with newline and wrap in {}
    const formattedBooks = `{\n${entries.join(",\n")}\n}`;

    // Send as plain text so line breaks are visible
    res.setHeader('Content-Type', 'text/plain');
    return res.status(200).send(formattedBooks);
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (isbn.length > 0) {
        return res.status(200).json(books[isbn]);
    } else {
        return res.status(404).json({ message: "Book not found" })
    }
});

// Get book details based on author
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const authorName = req.params.author.toLowerCase();

    // Build array of matching books including isbn
    const matchingBooks = Object.keys(books)
        .filter(isbn => books[isbn].author.toLowerCase() === authorName)
        .map(isbn => ({
            isbn,
            author: books[isbn].author,
            title: books[isbn].title,
            reviews: books[isbn].reviews
        }));

    if (matchingBooks.length > 0) {
        return res.status(200).json(matchingBooks); // send proper JSON
    } else {
        return res.status(404).json({ message: "No books found for the given author" });
    }
});



// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const bookTitle = req.params.title.toLowerCase();

    // Build array of matching books including isbn
    const matchingBooks = Object.keys(books)
        .filter(isbn => books[isbn].title.toLowerCase() === bookTitle)
        .map(isbn => ({
            isbn,
            author: books[isbn].author,
            title: books[isbn].title,
            reviews: books[isbn].reviews
        }));

    if (matchingBooks.length > 0) {
        return res.status(200).json(matchingBooks); // send proper JSON
    } else {
        return res.status(404).json({ message: "No books found for the given title" });
    }
});


// ---------------------
// Get book reviews by ISBN
// Endpoint: /review/:isbn
// ---------------------
public_users.get('/review/:isbn', async (req, res) => {
    const isbn = req.params.isbn; // Extract ISBN from URL

    try {
        // Check if the book exists in the database
        if (!books[isbn]) {
            return res.status(404).json({ message: "Book not found" });
        }

        const reviews = books[isbn].reviews;

        // If no reviews exist, return a clear message
        if (Object.keys(reviews).length === 0) {
            return res.status(200).json({ message: "No reviews available for this book." });
        }

        // If reviews exist, return them as JSON
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

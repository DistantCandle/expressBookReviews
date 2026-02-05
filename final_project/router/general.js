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
// Task 11: Get book by ISBN
// ---------------------
public_users.get('/isbn/:isbn', async (req, res) => {
    // Extract ISBN from the request parameters
    const isbn = req.params.isbn;

    try {
        // Fetch book by ISBN using Axios (simulate async call)
        const response = await axios
            .get(`http://localhost:5000/isbn/${isbn}`)
            .catch(() => ({ data: books[isbn] })); // fallback to local data

        // Check if book exists
        if (response.data) {
            return res.status(200).json(response.data); // send book details
        } else {
            return res.status(404).json({ message: "Book not found" });
        }
    } catch (err) {
        // Handle errors
        return res.status(500).json({ 
            message: "Error fetching book by ISBN", 
            error: err.message 
        });
    }
});

// ---------------------
// Task 12: Get books by Author
// ---------------------
public_users.get('/author/:author', async (req, res) => {
    const authorName = req.params.author; // extract author from URL

    try {
        // Initialize object to store books that match the author
        const matchingBooks = {};

        // Loop through all books to find matches
        Object.keys(books).forEach(key => {
            // Compare author names case-insensitively
            if (books[key].author.toLowerCase() === authorName.toLowerCase()) {
                matchingBooks[key] = books[key]; // add matching book
            }
        });

        // Check if any books matched
        if (Object.keys(matchingBooks).length > 0) {
            return res.status(200).json(matchingBooks); // return matched books
        } else {
            return res.status(404).json({ message: "No books found for the given author" });
        }
    } catch (err) {
        // Handle errors
        return res.status(500).json({ 
            message: "Error fetching books by author", 
            error: err.message 
        });
    }
});

// ---------------------
// Task 13: Get books by Title
// ---------------------
public_users.get('/title/:title', async (req, res) => {
    const bookTitle = req.params.title; // extract title from URL

    try {
        // Initialize object to store books that match the title
        const matchingBooks = {};

        // Loop through all books to find matches
        Object.keys(books).forEach(key => {
            // Compare book titles case-insensitively
            if (books[key].title.toLowerCase() === bookTitle.toLowerCase()) {
                matchingBooks[key] = books[key]; // add matching book
            }
        });

        // Check if any books matched
        if (Object.keys(matchingBooks).length > 0) {
            return res.status(200).json(matchingBooks); // return matched books
        } else {
            return res.status(404).json({ message: "No books found for the given title" });
        }
    } catch (err) {
        // Handle errors
        return res.status(500).json({ 
            message: "Error fetching books by title", 
            error: err.message 
        });
    }
});


//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn; // get ISBN from URL

    if (books[isbn]) {
        // Send only the reviews object
        const entries = Object.entries(books[isbn].reviews).map(
            ([key, value]) => `"${key}":${JSON.stringify(value)}`
        );
        const formattedBooks = `{\n${entries.join(",\n")}\n}`;

        // Send as plain text so line breaks are visible
        res.setHeader('Content-Type', 'text/plain');

        return res.status(200).send(formattedBooks);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;

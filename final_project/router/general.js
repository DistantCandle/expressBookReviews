const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    //Write your code here
    return res.status(300).json({});
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
public_users.get('/author/:author', function (req, res) {
    const authorName = req.params.author; // get author from URL
    const matchingBooks = {};

    // Iterate over books object
    Object.keys(books).forEach((key) => {
        if (books[key].author.toLowerCase() === authorName.toLowerCase()) {
            matchingBooks[key] = books[key];
        }
    });

    if (Object.keys(matchingBooks).length > 0) {
        // Format each entry on a new line
        const entries = Object.entries(matchingBooks).map(
            ([key, value]) => `"${key}":${JSON.stringify(value)}`
        );
        const formattedBooks = `{\n${entries.join(",\n")}\n}`;

        // Send as plain text so line breaks are visible
        res.setHeader('Content-Type', 'text/plain');

        return res.status(200).send(formattedBooks);
    } else {
        return res.status(404).json({ message: "No books found for the given author" });
    }
});


// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const bookTitle = req.params.title; // get author from URL
    const matchingBooks = {};

    // Iterate over books object
    Object.keys(books).forEach((key) => {
        if (books[key].title.toLowerCase() === bookTitle.toLowerCase()) {
            matchingBooks[key] = books[key];
        }
    });

    if (Object.keys(matchingBooks).length > 0) {
        // Format each entry on a new line
        const entries = Object.entries(matchingBooks).map(
            ([key, value]) => `"${key}":${JSON.stringify(value)}`
        );
        const formattedBooks = `{\n${entries.join(",\n")}\n}`;

        // Send as plain text so line breaks are visible
        res.setHeader('Content-Type', 'text/plain');
        
        return res.status(200).send(formattedBooks);
    } else {
        return res.status(404).json({ message: "No books found for the given title" });
    }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    //Write your code here
    return res.status(300).json({ message: "Yet to be implemente get review" });
});

module.exports.general = public_users;

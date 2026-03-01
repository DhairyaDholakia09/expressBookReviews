const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require("axios");


public_users.post("/register", (req, res) => {

    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
    }

    // Check if user already exists
    let userExists = users.find(user => user.username === username);

    if (userExists) {
        return res.status(409).json({ message: "User already exists" });
    }

    // Add new user
    users.push({
        username: username,
        password: password
    });

    return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
        const response = await axios.get('http://localhost:5000/');
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(500).json({ message: "Error retrieving books" });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    axios.get(`http://localhost:5000/isbn/${isbn}`)
        .then(response => {
            res.status(200).json(response.data);
        })
        .catch(error => {
            res.status(404).json({ message: "Book not found" });
        });
});
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author.toLowerCase();
    try {
        const response = await axios.get(`http://localhost:5000/`);
        const books = response.data;

        let filteredBooks = {};

        Object.keys(books).forEach(key => {
            if (books[key].author.toLowerCase() === author.toLowerCase()) {
                filteredBooks[key] = books[key];
            }
        });

        return res.status(200).json(filteredBooks);

    } catch (error) {
        return res.status(500).json({ message: "Error retrieving books" });
    }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title.toLowerCase();
    axios.get('http://localhost:5000/')
        .then(response => {

            const books = response.data;
            let filteredBooks = {};

            Object.keys(books).forEach(key => {
                if (books[key].title.toLowerCase() === title.toLowerCase()) {
                    filteredBooks[key] = books[key];
                }
            });

            res.status(200).json(filteredBooks);
        })
        .catch(error => {
            res.status(500).json({ message: "Error retrieving books" });
        });
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    if (books[isbn]) {
        return res.status(200).json(books[isbn].reviews);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});


module.exports.general = public_users;

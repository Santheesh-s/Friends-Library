
// Render login page
exports.login = (req, res) => {
    res.render("login"); // Render login.ejs
};

// Handle login
// Handle login
exports.loginTo = (req, res) => {
    const { user_name, password } = req.body;
    const query = "SELECT * FROM users WHERE user_name = $1 AND password = $2";
    pool.query(query, [user_name, password], (err, results) => {
        if (err) {
            console.error("Error executing query:", err);
            return res.status(500).json({ message: "An error occurred." });
        }

        if (results.rowCount === 1) {
            // ✅ Set session
            req.session.user = results.rows[0];
            res.redirect("/");
        } else {
            res.status(401).send("Invalid username or password");
        }
    });
};


// Render signup page
exports.signup = (req, res) => {
    res.render("signup"); // Render signup.ejs
};

// Handle signup
exports.signupS = (req, res) => {
    const { first_name, last_name, mob_no, user_name, password } = req.body;
    const query = "INSERT INTO users (first_name, last_name, mob_no, user_name, password) VALUES ($1, $2, $3, $4, $5)";
    pool.query(query, [first_name, last_name, mob_no, user_name, password], (err) => {
        if (err) {
            console.error("Error inserting data:", err);
            return res.status(500).json({ message: "An error occurred." });
        }
        res.redirect("/login");
    });
};

// Handle logout
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Logout error:", err);
        }
        res.redirect("/login");
    });
};


// Render homepage (book listing)
exports.home = (req, res) => {
    pool.query("SELECT * FROM books", (err, results) => {
        if (err) {
            console.error("Error fetching data:", err);
            res.status(500).send("Error fetching data");
        } else {
            res.render("index", { books: results.rows }); // Render index.ejs with book data
        }
    });
};

// Render form to add a new book
exports.addBook = (req, res) => {
    res.render("addBook"); // Render addBook.ejs
};

// Insert a new book into the database
exports.insertBook = (req, res) => {
    const { title, author, genre } = req.body;
    const photo = req.file ? req.file.buffer : null;

    const query = "INSERT INTO books (title, author, genre, photo) VALUES ($1, $2, $3, $4)";
    pool.query(query, [title, author, genre, photo], (err) => {
        if (err) {
            console.error("Error inserting data:", err);
            return res.status(500).send("Error inserting data");
        }
        res.redirect("/"); // Redirect to homepage after adding a book
    });
};


// Render the update book form
exports.renderUpdateBook = (req, res) => {
    const bookId = req.params.id;
    pool.query("SELECT * FROM books WHERE id = $1", [bookId], (err, results) => {
        if (err) {
            console.error("Error fetching data:", err);
            return res.status(500).send("Error fetching data");
        } else {
            res.render("updateBook", { book: results.rows[0] }); // Render updateBook.ejs
        }
    });
};
exports.updateBook = (req, res) => {
    const bookId = req.params.id;
    const { title, author, genre } = req.body;

    if (req.file) {
        // If a new photo is uploaded, update it
        const photo = req.file.buffer;
        const query = "UPDATE books SET title = $1, author = $2, genre = $3, photo = $4 WHERE id = $5";
        pool.query(query, [title, author, genre, photo, bookId], (err) => {
            if (err) {
                console.error("Error updating book with photo:", err);
                return res.status(500).send("Error updating book");
            }
            res.redirect("/");
        });
    } else {
        // No new photo uploaded, don't update the photo
        const query = "UPDATE books SET title = $1, author = $2, genre = $3 WHERE id = $4";
        pool.query(query, [title, author, genre, bookId], (err) => {
            if (err) {
                console.error("Error updating book without photo:", err);
                return res.status(500).send("Error updating book");
            }
            res.redirect("/");
        });
    }
};

// Delete a book from the database
exports.deleteBook = (req, res) => {
    const bookId = req.params.id;
    pool.query("DELETE FROM books WHERE id = $1", [bookId], (err) => {
        if (err) {
            console.error("Error deleting data:", err);
            return res.status(500).send("Error deleting data");
        }
        res.redirect("/"); // Redirect to homepage after deleting a book
    });
};

// Search for books
exports.searchBooks = (req, res) => {
    const searchTerm = req.body.searchTerm;
    pool.query("SELECT * FROM books WHERE title ILIKE $1", [`%${searchTerm}%`], (err, results) => {
        if (err) {
            console.error("Error searching books:", err);
            return res.status(500).send("Error searching books");
        } else {
            res.render("index", { books: results.rows }); // Render index.ejs with search results
        }
    });
};

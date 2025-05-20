
// Render login page
exports.login = (req, res) => {
    res.render("login"); // Render login.ejs
};

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
            res.redirect("/"); // Redirect to homepage
        } else {
            res.status(401).json({ message: "Invalid username or password" });
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
    res.redirect("/login");
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
    const photo = req.file ? req.file.filename : null;
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

// Update a book in the database
exports.updateBook = (req, res) => {
    const bookId = req.params.id;
    const { title, author, genre } = req.body;
    const photo = req.file ? req.file.filename : req.body.oldPhoto; // Use the old photo if no new photo is uploaded
    const query = "UPDATE books SET title = $1, author = $2, genre = $3, photo = $4 WHERE id = $5";
    pool.query(query, [title, author, genre, photo, bookId], (err) => {
        if (err) {
            console.error("Error updating data:", err);
            return res.status(500).send("Error updating data");
        }
        res.redirect("/"); // Redirect to homepage after updating a book
    });
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

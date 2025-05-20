gitconst express = require("express");
const { Pool } = require("pg"); // PostgreSQL connection
const bodyParser = require("body-parser");
const path = require("path");
const multer = require("multer");
const library = require("./routes/library"); // Routes for library

const app = express();
const port = process.env.PORT || 8080;

// Set up view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Configure PostgreSQL connection pool
const pool = new Pool({
    host: "localhost",
    user: "postgres",
    password: "santhukutty",
    database: "postgres", // Change to your desired database name
    port: 5432,
});

// Automatically create tables if they don't exist
const createTables = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS books (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                author VARCHAR(255) NOT NULL,
                genre VARCHAR(100),
                photo VARCHAR(255)
            );

            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                first_name VARCHAR(255) NOT NULL,
                last_name VARCHAR(255) NOT NULL,
                mob_no VARCHAR(15),
                user_name VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL
            );
        `);
        console.log("Tables created or already exist.");
    } catch (err) {
        console.error("Error creating tables:", err);
    }
};

// Run the function to create tables
createTables();

// Multer configuration for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });
global.pool = pool;
// Routes for user authentication
app.get("/login", library.login); // Login page
app.post("/login", library.loginTo); // Login action
app.get("/signup", library.signup); // Signup page
app.post("/signup", library.signupS); // Signup action
app.post("/logout", library.logout); // Logout action

// Routes for managing books
app.get("/", library.home); // Home page (list books)
app.get("/add", library.addBook); // Form to add book
app.post("/add", upload.single("photo"), library.insertBook); // Add book
app.get("/update/:id", library.renderUpdateBook); // Form to update book
app.post("/update/:id", upload.single("photo"), library.updateBook); // Update book
app.post("/delete/:id", library.deleteBook); // Delete book
app.post("/search", library.searchBooks); // Search books

// Start the server
app.listen(port, () => {
    console.log(`Library management system running on port ${port}`);
});

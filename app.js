const express = require("express");
const session = require("express-session");
const { Pool } = require("pg");
const bodyParser = require("body-parser");
const path = require("path");
const multer = require("multer");
const library = require("./routes/library");

const app = express();
const port = process.env.PORT || 8080;

// Set up view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

// ✅ Session setup
app.use(session({
    secret: "your_super_secret_key", // Change this to a secure random string
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // set to true in production with HTTPS
}));

// ✅ Make session available in EJS
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

// ✅ Auth middleware
function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    next();
}

// ✅ PostgreSQL connection using SSL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_URqtbcwve0Z5@ep-icy-violet-a53k6c48-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require",
    ssl: {
        rejectUnauthorized: false
    }
});
global.pool = pool;

// ✅ Automatically create tables
const createTables = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS books (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                author VARCHAR(255) NOT NULL,
                genre VARCHAR(100),
                photo BYTEA
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
createTables();

// ✅ Multer for buffer uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Auth routes
app.get("/login", library.login);
app.post("/login", library.loginTo);
app.get("/signup", library.signup);
app.post("/signup", library.signupS);
app.post("/logout", library.logout);

// ✅ Book routes (protected)
app.get("/", requireLogin, library.home);
app.get("/add", requireLogin, library.addBook);
app.post("/add", requireLogin, upload.single("photo"), library.insertBook);
app.get("/update/:id", requireLogin, library.renderUpdateBook);
app.post("/update/:id", requireLogin, upload.single("photo"), library.updateBook);
app.post("/delete/:id", requireLogin, library.deleteBook);
app.post("/search", requireLogin, library.searchBooks);

// ✅ Serve photo from DB
app.get("/photo/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query("SELECT photo FROM books WHERE id = $1", [id]);
        if (result.rows.length && result.rows[0].photo) {
            res.set("Content-Type", "image/jpeg");
            res.send(result.rows[0].photo);
        } else {
            res.status(404).send("Image not found");
        }
    } catch (err) {
        console.error("Error retrieving image:", err);
        res.status(500).send("Server error");
    }
});

// ✅ Start the server
app.listen(port, () => {
    console.log(`Library management system running on port ${port}`);
});

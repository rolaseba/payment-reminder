const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database Setup
const db = new sqlite3.Database('./payments.db', (err) => {
    if (err) {
        console.error('Error opening database', err);
    } else {
        console.log('Connected to SQLite database.');
        initDb();
    }
});

function initDb() {
    db.serialize(() => {
        // Categories Table
        db.run(`CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            color TEXT DEFAULT '#3b82f6'
        )`);

        // Reminders Table
        db.run(`CREATE TABLE IF NOT EXISTS reminders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            category_id INTEGER,
            day_of_month INTEGER NOT NULL,
            amount_approx REAL,
            FOREIGN KEY(category_id) REFERENCES categories(id)
        )`);

        // Payments Table
        db.run(`CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            reminder_id INTEGER NOT NULL,
            paid_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            period_month INTEGER,
            period_year INTEGER,
            amount REAL,
            FOREIGN KEY(reminder_id) REFERENCES reminders(id)
        )`);

        // Seed default categories if empty
        db.get("SELECT count(*) as count FROM categories", (err, row) => {
            if (row.count === 0) {
                const stmt = db.prepare("INSERT INTO categories (name, color) VALUES (?, ?)");
                stmt.run("Energía", "#f59e0b"); // Amber
                stmt.run("Gas", "#ef4444"); // Red
                stmt.run("Internet", "#3b82f6"); // Blue
                stmt.run("Agua", "#10b981"); // Green
                stmt.finalize();
            }
        });
    });
}

// API Routes

// Get all categories
app.get('/api/categories', (req, res) => {
    db.all("SELECT * FROM categories", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Add category
app.post('/api/categories', (req, res) => {
    const { name, color } = req.body;
    db.run("INSERT INTO categories (name, color) VALUES (?, ?)", [name, color], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, name, color });
    });
});

// Delete category
app.delete('/api/categories/:id', (req, res) => {
    db.run("DELETE FROM categories WHERE id = ?", req.params.id, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Deleted", changes: this.changes });
    });
});

// Get all reminders
app.get('/api/reminders', (req, res) => {
    const sql = `
        SELECT r.*, c.name as category_name, c.color as category_color 
        FROM reminders r 
        LEFT JOIN categories c ON r.category_id = c.id
    `;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Add reminder
app.post('/api/reminders', (req, res) => {
    const { title, category_id, day_of_month, amount_approx } = req.body;
    db.run(
        "INSERT INTO reminders (title, category_id, day_of_month, amount_approx) VALUES (?, ?, ?, ?)",
        [title, category_id, day_of_month, amount_approx],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, title, category_id, day_of_month, amount_approx });
        }
    );
});

// Delete reminder
app.delete('/api/reminders/:id', (req, res) => {
    db.run("DELETE FROM reminders WHERE id = ?", req.params.id, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Deleted", changes: this.changes });
    });
});

// Update reminder
app.put('/api/reminders/:id', (req, res) => {
    const { title, category_id, day_of_month, amount_approx } = req.body;
    db.run(
        "UPDATE reminders SET title = ?, category_id = ?, day_of_month = ?, amount_approx = ? WHERE id = ?",
        [title, category_id, day_of_month, amount_approx, req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Updated", changes: this.changes });
        }
    );
});

// Get payments (history)
app.get('/api/payments', (req, res) => {
    const sql = `
        SELECT p.*, r.title as reminder_title 
        FROM payments p
        JOIN reminders r ON p.reminder_id = r.id
        ORDER BY p.paid_at DESC
    `;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Add payment (Mark as paid)
app.post('/api/payments', (req, res) => {
    const { reminder_id, period_month, period_year, amount } = req.body;
    db.run(
        "INSERT INTO payments (reminder_id, period_month, period_year, amount) VALUES (?, ?, ?, ?)",
        [reminder_id, period_month, period_year, amount],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, reminder_id, period_month, period_year, amount });
        }
    );
});

// Get payments for a specific period (to check status)
app.get('/api/payments/check', (req, res) => {
    const { month, year } = req.query;
    db.all(
        "SELECT reminder_id FROM payments WHERE period_month = ? AND period_year = ?",
        [month, year],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows.map(r => r.reminder_id));
        }
    );
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

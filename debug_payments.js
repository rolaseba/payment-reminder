const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./payments.db');

db.serialize(() => {
    console.log("--- Reminders ---");
    db.all("SELECT * FROM reminders", (err, rows) => {
        if (err) console.error(err);
        else console.table(rows);

        console.log("\n--- Payments ---");
        db.all("SELECT p.*, r.title FROM payments p JOIN reminders r ON p.reminder_id = r.id ORDER BY p.paid_at DESC", (err, rows) => {
            if (err) console.error(err);
            else console.table(rows);
            db.close();
        });
    });
});

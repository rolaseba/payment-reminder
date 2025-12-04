const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./payments.db');

db.serialize(() => {
    // We know the payment ID is 3 from the debug output
    const paymentId = 3;
    const correctMonth = 10; // November (0-indexed)

    db.run("UPDATE payments SET period_month = ? WHERE id = ?", [correctMonth, paymentId], function (err) {
        if (err) {
            return console.error(err.message);
        }
        console.log(`Row(s) updated: ${this.changes}`);

        // Verify
        db.get("SELECT * FROM payments WHERE id = ?", [paymentId], (err, row) => {
            if (err) console.error(err);
            else console.log("Updated row:", row);
            db.close();
        });
    });
});

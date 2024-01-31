const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./py4bio.db', (err) => {
  if (err) {
    console.error(err.message);
    response.status(500).send('An error occurred while processing the form.');
    return;
  }
  console.log('Connected to the SQLite database.');
});

module.exports = db;
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const app = express();
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'ddas'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Database connected!');
});

// Endpoint to check for duplicates
app.post('/checkDuplicate', (req, res) => {
    const { fileName, fileSize, location } = req.body;

    const query = `SELECT * FROM file_metadata WHERE fileName = ? OR fileSize = ? OR location = ?`;
    db.query(query, [fileName, fileSize, location], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            res.json({
                isDuplicate: true,
                duplicates: results.map(r => ({
                    fileName: r.fileName,
                    directory: r.directory,
                    timestamp: r.timestamp
                }))
            });
        } else {
            res.json({ isDuplicate: false });
        }
    });
});

app.listen(3000, () => {
    console.log('Backend server running on http://localhost:3000');
});

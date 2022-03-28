const express = require('express');
const app = express();
var mysql = require('mysql');

app.use(express.json());

var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "hello12345",
    database: "auto_insurance"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("Connected to Database!");
});

app.get('/', (req, res) => {
    connection.query("SELECT * FROM accessory", function (err, acc, fields) {
        if (err) throw err;
        res.json(acc);
    });
})
app.listen(3000, () => {
    console.log("Listening on port 3000")
});
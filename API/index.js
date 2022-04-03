const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
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
    //Just a sample query, commented for reference.
    // connection.query("SELECT * FROM accessory", function (err, acc, fields) {
    //     if (err) throw err;
    //     res.json(acc);
    // });
    res.send("Hello!");
})
//Sign up works and hashes password using bcrypt, inserts it into our sql database
app.post('/api/customer/signUp', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        var sql = `INSERT INTO customer (Fname, MName, LName, Addr_Line, Province, Country, Phone_No, Email, Sex, Birth_Date, Password, Transit_No, Institute_No, Acct_No) VALUES ('${req.body.fname}', '${req.body.mname}', '${req.body.lname}', '${req.body.addr}', '${req.body.province}', '${req.body.country}', '${req.body.phone}', '${req.body.email}', '${req.body.sex}', '${req.body.bdate}', '${hashedPassword}', '${req.body.transitno}', '${req.body.instno}', '${req.body.instno}')`;
        connection.query(sql, function (err, result) {
            if (err) {
                res.status(500).send();
                console.log(err);
                return;
            }
            res.status(201).send();
        });
    }
    catch {
        res.status(500).send();
    }
});
//THIS DOES NOT WORK YET
app.post('/api/customer/logIn', async (req, res) => {
    let sql = `SELECT Password FROM customer WHERE Email = '${req.body.email}'`;
    connection.query(sql, function (error, result) {
        console.log(req.body.password);
        bcrypt.compare(req.body.password, result[0].Password, function (err, res) {
            if (err) {
                console.log(err);
            }
            if (res) {
                res.status(200).send();
            } else {
                console.log("Wrong Password");
            }
        });
    })
});
app.listen(3000, () => {
    console.log("Listening on port 3000")
});
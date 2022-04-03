const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
var mysql = require('mysql');

app.use(express.json());

var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "sql_password",
    database: "auto_insurance"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("Connected to Database!");
});

app.get('/', (req, res) => {
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

//POST endpoint for creating a tuple in claim table
app.post('/api/claim', (req, res) => {
    connection.query('INSERT INTO CLAIM (Accident_Date, Status, Type, location) VALUES (?, ?, ?, ?)', 
    [req.body.accident_date, req.body.status, req.body.type, req.body.location], 
    (error, results, fields) => {
        if (error) {
            res.status(500).send();
            console.log(error);
            return;
        }
        res.status(201).send({"id": results.insertId});
    });
});

//PATCH endpoint for updating status in claim table
app.patch('/api/claim', (req, res) => {
    connection.query('UPDATE CLAIM SET Status = ? WHERE ClaimID = ?', [req.body.status, req.body.Claim_ID],
    (error, results, fields) => {
        if (error) {
            res.status(500).send();
            console.log(error);
            return;
        }
        res.status(200).send();
    });
});

//PUT endpoint for updating a tuple in claim table
app.put('/api/claim', (req, res) => {
    connection.query('UPDATE CLAIM SET Accident_Date = ?, Status = ?, Type = ?, location = ? WHERE ClaimID = ?', 
    [req.body.accident_date, req.body.status, req.body.type, req.body.location, req.body.Claim_ID],
    (error, results, fields) => {
        if (error) {
            res.status(500).send();
            console.log(error);
            return;
        }
        res.status(200).send();
    });
});

//GET endpoint for claim table to get all claims for a policy
app.get('/api/claim', (req, res) => {
    connection.query('SELECT claim.ClaimID, claim.Accident_Date FROM claim JOIN related_to ON (claim.ClaimID = related_to.ClaimID) WHERE PolicyNo = ?', 
    [req.body.PolicyNo],
    (error, results, fields) => {
        if (error) {
            res.status(500).send();
            console.log(error);
            return;
        }
        res.json(results);
    });
});

//GET a specific vehicle
app.get('/api/vehicle/:vin', (req, res) => {
    connection.query('SELECT * FROM vehicle WHERE VIN = ?', 
    [req.params.vin],
    (error, results, fields) => {
        if (error) {
            res.status(500).send();
            console.log(error);
            return;
        }
        res.json(results[0]);
    });
});

//POST endpoint for creating a tuple in vehicle table
app.post('/api/vehicle', (req, res) => {
    connection.query('INSERT INTO vehicle (VIN, Year, Make, Uses, Km_per_yr, Lease_status, Driving_record, PolicyNo) VALUES (?,?,?,?,?,?,?,?);', 
    [req.body.VIN, req.body.year, req.body.make, req.body.uses, req.body.km, req.body.lease_status, req.body.driving_record, req.body.PolicyNo], 
    (error, results, fields) => {
        if (error) {
            res.status(500).send();
            console.log(error);
            return;
        }
        res.status(201).send();
    });
});

//PUT endpoint for updating a tuple in vehicle table
app.put('/api/vehicle', (req, res) => {
    connection.query('UPDATE vehicle SET Year = ?, Make = ?, Uses = ?, Km_per_yr = ?, Lease_status = ?, Driving_record = ?, PolicyNo = ? WHERE VIN = ?', 
    [req.body.year, req.body.make, req.body.uses, req.body.km, req.body.lease_status, req.body.driving_record, req.body.PolicyNo, req.body.VIN], 
    (error, results, fields) => {
        if (error) {
            res.status(500).send();
            console.log(error);
            return;
        }
        res.status(201).send();
    });
});

//GET endpoint for selecting tuples from vehicle table
app.get('/api/vehicle', (req, res) => {
    connection.query('SELECT vehicle.VIN, Year, Make FROM vehicle JOIN involved_in_vehicle ON (vehicle.VIN = involved_in_vehicle.VIN) WHERE PolicyNo = ? AND ClaimID = ?', 
    [req.body.PolicyNo, req.body.Claim_ID], 
    (error, results, fields) => {
        if (error) {
            res.status(500).send();
            console.log(error);
            return;
        }
        res.json(results);
    });
});

//GET endpoint for selecting a tuple from driver table
app.get('/api/driver/:licNo/:licProv/:licDate', (req, res) => {
    connection.query('SELECT * FROM driver WHERE License_Date = ? AND License_No = ? AND License_Prov = ?', 
    [req.params.licDate, req.params.licNo, req.params.licProv], 
    (error, results, fields) => {
        if (error) {
            res.status(500).send();
            console.log(error);
            return;
        }
        res.json(results[0]);
    });
});

//GET endpoint for selecting a tuple from driver table
app.get('/api/driver/:licNo/:licProv/:licDate', (req, res) => {
    connection.query('SELECT * FROM driver WHERE License_Date = ? AND License_No = ? AND License_Prov = ?', 
    [req.params.licDate, req.params.licNo, req.params.licProv], 
    (error, results, fields) => {
        if (error) {
            res.status(500).send();
            console.log(error);
            return;
        }
        res.json(results[0]);
    });
});

//POST endpoint for creating a tuple in driver table
app.post('/api/driver', (req, res) => {
    connection.query('INSERT INTO driver (License_Date, License_No, License_Prov, FName, MName, LName, Training, Sex, Birth_Date, Grid_Rating, License_Class) VALUES (?,?,?,?,?,?,?,?,?,?,?)', 
    [req.body.license_date, req.body.license_no, req.body.license_prov, req.body.fname, req.body.mname, req.body.lname, 
        req.body.training, req.body.sex, req.body.birth_date, req.body.grid_rating, req.body.license_class], 
    (error, results, fields) => {
        if (error) {
            res.status(500).send();
            console.log(error);
            return;
        }
        res.status(201).send();
    });
});

app.listen(3000, () => {
    console.log("Listening on port 3000")
});
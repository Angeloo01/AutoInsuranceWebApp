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

//THIS DOES NOT WORK YET
// app.post('/api/customer/logIn', async (req, res) => {
//     let sql = `SELECT Password FROM customer WHERE Email = '${req.body.email}'`;
//     connection.query(sql, function (error, result) {
//         console.log(req.body.password);
//         bcrypt.compare(req.body.password, result[0].Password, function (err, res) {
//             if (err) {
//                 console.log(err);
//             }
//             if (res) {
//                 res.status(200).send();
//             } else {
//                 console.log("Wrong Password");
//             }
//         });
//     })
// });
//GET endpoint for searching for a customer
app.get('/api/customer', (req, res) => {
    connection.query('SELECT customer.CustomerNo, customer.Fname, customer.Lname  FROM customer WHERE Fname = ? AND Lname = ? AND Addr_line = ? AND Province = ? AND Country = ? AND Phone_No = ? AND Birth_Date = ?',
        [req.body.fname, req.body.lname, req.body.addr, req.body.prov, req.body.country, req.body.phone, req.body.bdate],
        (error, results, fields) => {
            if (error) {
                res.status(500).send();
                console.log(error);
                return;
            }
            res.json(results);
        });
});
//PUT Method to edit customer's information
app.put('/api/customer', (req, res) => {
    connection.query('UPDATE customer SET Addr_Line = ?, Country = ?, Phone_No = ?, Province = ?, Email = ?, Sex = ?, Birth_date = ?, Transit_No = ?, Institute_No = ?, Acct_No = ? WHERE Fname = ? AND Mname = ? AND Lname = ?',
        [req.body.addr, req.body.phone, req.body.country, req.body.prov, req.body.email, req.body.sex, req.body.bdate, req.body.transitno, req.body.instituteno, req.body.acctno, req.body.fname, req.body.mname, req.body.lname],
        (error, results, fields) => {
            if (error) {
                res.status(500).send();
                console.log(error);
                return;
            }
            res.status(200).send();
        });
});
//GET Method to view customer's information
app.get('/api/customer/viewInformation', (req, res) => {
    connection.query('SELECT * FROM customer WHERE CustomerNo = ?',
        [req.body.customerno],
        (error, results, fields) => {
            if (error) {
                res.status(500).send();
                console.log(error);
                return;
            }
            res.json(results);
        });
})
//POST Method for adding a new customer tuple to the database. The hashing can be removed.
app.post('/api/customer', async (req, res) => {
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
//GET Method to search for a Policy
app.get('/api/policy', (req, res) => {
    connection.query('SELECT policy.PolicyNo, policy.EffectiveDate, policy.Status, customer.Fname, customer.Lname FROM policy JOIN customer ON (policy.CustomerNo = customer.CustomerNo) WHERE customer.Fname = ? AND customer.Lname = ? AND policy.EffectiveDate = ? AND policy.Status = ?',
        [req.body.fname, req.body.lname, req.body.edate, req.body.status],
        (error, results, fields) => {
            if (error) {
                res.status(500).send();
                console.log(error);
                return;
            }
            res.json(results);
        });
})
//POST Method to create new policy
app.post('/api/policy', (req, res) => {
    connection.query('INSERT INTO policy (Deductible, EffectiveDate, Status, Premium, CustomerNo) VALUES (?,?,?,?,?)',
        [req.body.deductible, req.body.edate, req.body.status, req.body.premium, req.body.customerno],
        (error, results, fields) => {
            if (error) {
                res.status(500).send();
                console.log(error);
                return;
            }
            res.status(200).send();
        });
})
//GET Method to view a policy
app.get('/api/policy/view', (req, res) => {
    connection.query('SELECT * FROM policy WHERE PolicyNo = ?',
        [req.body.policyno],
        (error, results, fields) => {
            if (error) {
                res.status(500).send();
                console.log(error);
                return;
            }
            res.json(results);
        });
})
//GET Method to list all policies for a customer
app.get('/api/policy/list', (req, res) => {
    connection.query('SELECT policy.PolicyNo, policy.EffectiveDate FROM policy JOIN customer ON (policy.CustomerNo = customer.CustomerNo) WHERE policy.CustomerNo = ?',
        [req.body.customerno],
        (error, results, fields) => {
            if (error) {
                res.status(500).send();
                console.log(error);
                return;
            }
            res.json(results);
        });
})
//GET Method to view claim information
app.get('/api/claim/view', (req, res) => {
    connection.query('SELECT * FROM claim WHERE ClaimID = ?',
        [req.body.claimno],
        (error, results, fields) => {
            if (error) {
                res.status(500).send();
                console.log(error);
                return;
            }
            res.json(results);
        });
})
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
            res.status(201).send({ "id": results.insertId });
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
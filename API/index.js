const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
var mysql = require('mysql');

app.use(express.json());

var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    //password: "hello12345",
    password: "sql_password",
    database: "auto_insurance"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("Connected to Database!");
});

app.post('/api/customer/login', async (req, res) => {
    let sql = `SELECT password, CustomerNo FROM customer WHERE Email = '${req.body.email}'`;
    connection.query(sql, function (error, results, fields) {
        //console.log(results);
        if (results[0] && req.body.password === results[0].password) {
            res.json({ 'CustomerNo': results[0].CustomerNo });
        }
        else {
            res.status(401).send('bad credentials');
        }
    })
});

//GET endpoint for searching for a customer
app.get('/api/customer', (req, res) => {
    connection.query('SELECT customer.CustomerNo, customer.Fname, customer.Lname  FROM customer WHERE Fname = ? AND Lname = ? AND Addr_line = ? AND Province = ? AND Country = ? AND Phone_No = ? AND Birth_Date = ?',
        [req.query.fname, req.query.lname, req.query.addr, req.query.prov, req.query.country, req.query.phone, req.query.bdate],
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
        [req.query.customerno],
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
        //const hashedPassword = await bcrypt.hash(req.body.password, 10);
        var sql = `INSERT INTO customer (Fname, MName, LName, Addr_Line, Province, Country, Phone_No, Email, Sex, Birth_Date, Password, Transit_No, Insititute_No, Acct_No) VALUES ('${req.body.firstName}', '${req.body.middleName}', '${req.body.lastName}', '${req.body.address}', '${req.body.province}', '${req.body.country}', '${req.body.phone}', '${req.body.email}', '${req.body.sex}', '${req.body.birthday}', '${req.body.password}', '${req.body.transitno}', '${req.body.instno}', '${req.body.acctno}')`;
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
        [req.query.fname, req.query.lname, req.query.edate, req.query.status],
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
        [req.query.policyno],
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
        [req.query.customerno],
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
        [req.query.claimno],
        (error, results, fields) => {
            if (error) {
                res.status(500).send();
                console.log(error);
                return;
            }
            res.json(results[0]);
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
        [req.query.PolicyNo],
        (error, results, fields) => {
            if (error) {
                res.status(500).send();
                console.log(error);
                return;
            }
            console.log(results);
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
        [req.query.PolicyNo, req.query.Claim_ID],
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

//PUT method for updating a driver's information
app.put('/api/driver', (req, res) => {
    connection.query('UPDATE driver SET License_Date = ?, License_No = ?, License_Prov = ?, FName = ?, MName = ?, LName = ?, Training = ?, Sex = ?, Birth_Date = ?, Grid_Rating = ?, License_Class = ? WHERE License_Date = ? AND License_No = ? AND License_Prov = ?',
        [req.body.license_date, req.body.license_no, req.body.license_prov,
        req.body.fname, req.body.mname, req.body.lname,
        req.body.training, req.body.sex, req.body.birth_date, req.body.grid_rating, req.body.license_class,
        req.body.id_license_date, req.body.id_license_no, req.body.id_license_prov],
        (error, results, fields) => {
            if (error) {
                res.status(500).send();
                console.log(error);
                return;
            }
            res.status(200).send();
        });
});

//GET method for listing all drivers on a policy or involved in a claim
//Endpoint has been changed from blueprint, now also returns F/T party and % at fault or relationship as appropriate
app.get('/api/driver', (req, res) => {
    connection.query("SELECT d.License_No, d.FName, d.LName, df.Relationship FROM driver AS d, driver_for as df WHERE df.PolicyNo = ? AND d.License_No = df.License_No AND d.License_Date = df.License_Date AND d.License_Prov = df.License_Prov UNION SELECT d.License_No, d.FName, d.LName, iid.F_T_Party, iid.Percent_At_Fault FROM driver AS d, involved_in_driver AS iid WHERE iid.ClaimID = ? AND d.License_No = iid.License_No AND d.License_Date = iid.License_Date AND d.License_Prov = iid.License_Prov",
        [req.query.PolicyNo, req.query.ClaimID],
        (error, results, fields) => {
            if (error) {
                res.status(500).send();
                console.log(error);
                return;
            }
            res.json(results);
        });
});

//GET method for listing all managers
app.get('/api/manager', (req, res) => {
    connection.query("SELECT ManagerID, Username FROM manager",
        (error, results, fields) => {
            if (error) {
                res.status(500).send();
                console.log(error);
                return;
            }
            res.json(results);
        });
});

//GET method for listing all payments on a policy
app.get('/api/payment', (req, res) => {
    connection.query("SELECT TransactionID, Amount, Date FROM payment WHERE PolicyNo = ?",
        [req.query.policyno],
        (error, results, fields) => {
            if (error) {
                res.status(500).send();
                console.log(error);
                return;
            }
            res.json(results);
        });
});

//POST method for adding a payment to a policy
app.post('/api/payment', (req, res) => {
    connection.query('INSERT INTO payment (PolicyNo, TransactionID, Amount, Date) VALUES (?,?,?,?)',
        [req.body.policyno, req.body.transactionid, req.body.amount, req.body.date],
        (error, results, fields) => {
            if (error) {
                res.status(500).send();
                console.log(error);
                return;
            }
            res.status(201).send();
        });
});

//GET method for listing all notes on a policy
app.get('/api/note', (req, res) => {
    connection.query("SELECT Note_Title, Date, Text, ManagerID FROM note WHERE PolicyNo = ?",
        [req.query.policyno],
        (error, results, fields) => {
            if (error) {
                res.status(500).send();
                console.log(error);
                return;
            }
            res.json(results);
        });
});

//POST method for a manager to add a note to a policy
app.post('/api/note', (req, res) => {
    connection.query('INSERT INTO note (PolicyNo, Note_Title, Date, Text, ManagerID) VALUES (?,?,?,?,?)',
        [req.body.policyno, req.body.note_title, req.body.date, req.body.text, req.body.ManagerID],
        (error, results, fields) => {
            if (error) {
                res.status(500).send();
                console.log(error);
                return;
            }
            res.status(201).send();
        });
});

//GET method for listing a driver's convictions
app.get('/api/conviction', (req, res) => {
    connection.query("SELECT * FROM conviction WHERE License_Date = ? AND License_No = ? AND License_Prov = ?",
        [req.query.license_date, req.query.license_no, req.query.license_prov],
        (error, results, fields) => {
            if (error) {
                res.status(500).send();
                console.log(error);
                return;
            }
            res.json(results);
        });
});

//POST method for adding a conviction for a driver
app.post('/api/conviction', (req, res) => {
    connection.query('INSERT INTO conviction (License_Date, License_No, License_Prov, Date, Degree) VALUES (?,?,?,?,?)',
        [req.body.license_date, req.body.license_no, req.body.license_prov, req.body.date, req.body.degree],
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
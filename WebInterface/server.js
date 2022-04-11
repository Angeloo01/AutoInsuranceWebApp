const apiURL = 'http://localhost:3000';
const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
const fetch = require('node-fetch');
const { readdirSync } = require('fs');
const { response } = require('express');

//Setting up view engine.
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('views/Customer Menus'));
app.use(express.static('views/customer sign up'));
app.use(express.urlencoded({ extended: true })); //to parse HTML form data (aka read HTML form data)
//app.use(express.static(path.join(__dirname, '/public')));
app.use(express.json());
app.use(session({
    secret: 'secretforcpsc371autoinsurancewebapp',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 },//60 minutes
    rolling: true
}));

//middleware to check if customer is logged in
function authCustomer(req, res, next) {
    if (req.session.logType) {
        if (req.session.logType === 'customer') {
            next();
            return;
        }
    }
    res.status(401).send("You must log in first!");
    return;
}

//middleware to check if manager is logged in
function authManager(req, res, next) {
    if (req.session.logType) {
        if (req.session.logType === 'manager') {
            next();
            return;
        }
    }
    res.status(401).send("You must log in first!");
    return;
}

//middleware to check if manager is logged in
function authManagerOrCustomer(req, res, next) {
    if (req.session.logType) {
        if (req.session.logType === 'manager' || req.session.logType === 'customer') {
            next();
            return;
        }
    }
    res.status(401).send("You must log in first!");
    return;
}

//endpoint to test authCustomer
app.get('/tryCustomerOnly', authCustomer, (req, res) => {
    res.send("hello customer");
});

//endpoint to test authManager
app.get('/tryManagerOnly', authManager, (req, res) => {
    res.send("hello manager");
});

//main page
app.get('/', (req, res) => {
    let testData = [1, 2, 3, 4];
    //if customer
    if (req.session.email) {
        res.render('Customer Menus/CustomerMenu', { 'email': req.session.email });
        return;
    }
    //if manager
    else if (req.session.ManagerID) {
        res.render('Customer Menus/ManagerMenu', { 'ManagerID': req.session.ManagerID });
        return;
    }
    //if not logged in
    res.render('front page');
});

//load page for sign up
app.get('/signup', (req, res) => {
    res.render('customer sign up/signup');
});

//endpoint for post new user
app.post('/signup', async (req, res) => {
    const { firstName, middleName, lastName, email, password, phone, sex,
        birthday, address, country, province, zip } = req.body;
    console.log(req.body);

    //call api using fetch
    try {
        const response = await fetch((apiURL + '/api/customer'), {
            method: 'post',
            body: JSON.stringify(req.body),
            headers: { 'Content-Type': 'application/json' }
        });

        res.redirect('/');
    }
    //if error is returned
    catch (error) {
        console.log(error);
        res.status(400).redirect('/');
    }
});

//post method to login customer
//needs to be an async function to fetch
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    //call api
    try {
        const response = await fetch(apiURL + '/api/customer/login', {
            method: 'post',
            body: JSON.stringify({ email, password }),
            headers: { 'Content-Type': 'application/json' }
        });
        //convert response to json
        const { CustomerNo } = await response.json()

        //sessions stuff
        req.session.CustomerNo = CustomerNo;
        req.session.email = email;
        req.session.logType = 'customer';
        res.redirect('/');
    }
    //if error is returned
    catch (error) {
        //console.log(error);
        res.status(401).render('front page', { 'badCred': true });
    }

});

//login page for manager
app.get('/managerLogin', (req, res) => {
    if (req.session.ManagerID) {
        res.redirect('/');
        return;
    }
    res.render('managerLogin');
});

//post login for manager
app.post('/managerLogin', async (req, res) => {
    const { username, password } = req.body;

    //call api
    try {
        const response = await fetch(apiURL + '/api/manager/login', {
            method: 'post',
            body: JSON.stringify({ username, password }),
            headers: { 'Content-Type': 'application/json' }
        });
        //convert response to json
        const { ManagerID } = await response.json()

        //sessions stuff
        req.session.username = username;
        req.session.ManagerID = ManagerID;
        req.session.logType = 'manager';
        res.redirect('/');
    }
    //if error is returned
    catch (error) {
        //console.log(error);
        res.status(401).render('managerLogin', { 'badCred': true });
    }

});

//logout user
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

//view claims page for customer
//call authCustomer: only customers can access page
app.get('/claims', authCustomer, async (req, res) => {
    //call api
    try {
        //get fetch
        const response = await fetch(apiURL + '/api/policy/list' + `?customerno=${req.session.CustomerNo}`);
        //convert response to json
        const policies = await response.json();

        var claims = new Array();
        for (const curr of policies) {
            const response2 = await fetch(apiURL + '/api/claim' + `?PolicyNo=${curr.PolicyNo}`);
            const claimRes = await response2.json();

            for (const c of claimRes) {
                const response3 = await fetch(apiURL + '/api/claim/view' + `?claimno=${c.ClaimID}`);
                const claim = await response3.json();
                claims.push(claim);
            }
        };

        //console.log(claims);

        res.render('customerClaimView', { claims });
    }
    //if error is returned
    catch (error) {
        console.log(error);
        res.status(400).redirect('/');
    }
});

//get view of a single claim
app.get('/claims/:ClaimID', authCustomer, async (req, res) => {
    const ClaimID = req.params.ClaimID;
    console.log('calling claims claimid ' + req.params.ClaimID);
    //call api
    try {
        //get fetch
        var response = await fetch(apiURL + '/api/customer/viewInformation' + `?customerno=${req.session.CustomerNo}`);
        //convert response to json
        const customer = await response.json();

        //get fetch
        response = await fetch(apiURL + '/api/claim/view' + `?claimno=${ClaimID}`);
        //convert response to json
        const claim = await response.json();

        //get fetch
        response = await fetch(apiURL + '/api/vehicle/' + `${claim.VIN}`);
        //convert response to json
        const vehicle = await response.json();

        //get fetch
        response = await fetch(apiURL + '/api/driver/' + `${claim.License_No}/${claim.License_Prov}/${claim.License_Date.split('T')[0]}`);
        //convert response to json
        const driver = await response.json();

        //console.log()
        //console.log({...(customer[0]), ...claim, vehicle, driver});

        res.render('customer sign up/reviewClaimCustomer', { ...(customer[0]), ...claim, vehicle, driver });
    }
    //if error is returned
    catch (error) {
        console.log(error);
        res.status(400).redirect('/claims');
    }
});

//get file claim customer; auth customer
app.get('/customer/fileClaim', authCustomer, async (req, res) => {

    // res.render('customer sign up/fileClaim', {FName: "test", MName: "test1", LName: "test2", Email: "test@abc", Phone_No: "123456", 
    //                                             policy: [{PolicyNo: 1}, {PolicyNo: 2}], driver: [{FName: "test", LName: "test1"}, {FName: "test2", LName: "test3"}]});

    //call api
    try {
        //get fetch
        const response0 = await fetch(apiURL + '/api/customer/viewInformation' + `?customerno=${req.session.CustomerNo}`);
        //convert response to json
        const customer = await response0.json();

        //get fetch
        const response = await fetch(apiURL + '/api/policy/list' + `?customerno=${req.session.CustomerNo}`);
        //convert response to json
        const policies = await response.json();

        var drivers = new Array();
        var vehicles = new Array();
        for (const curr of policies) {
            var response2 = await fetch(apiURL + '/api/driver' + `?PolicyNo=${curr.PolicyNo}&ClaimID=`);
            const drvs = await response2.json();
            for (const d of drvs) {
                drivers.push(d);
            }

            response2 = await fetch(apiURL + '/api/vehicle' + `?PolicyNo=${curr.PolicyNo}&ClaimID=`);
            vehs = await response2.json();
            for (const v of vehs) {
                vehicles.push(v);
            }
        };

        customer[0].policy = policies;
        customer[0].driver = drivers;
        customer[0].vehicle = vehicles;

        //console.log(customer);
        res.render('customer sign up/fileClaim', customer[0]);
    }
    //if error is returned
    catch (error) {
        console.log(error);
        res.status(400).redirect('/');
    }
});

//post file claim customer; auth customer
app.post('/customer/fileClaim', authManagerOrCustomer, async (req, res) => {
    req.body.driver = JSON.parse(req.body.driver);
    //console.log(req.body);
    //res.redirect('/claims');
    //return;
    //call api
    try {
        var response = await fetch(apiURL + '/api/claim', {
            method: 'post',
            body: JSON.stringify({ accident_date: req.body.accident_date, status: 'under review', type: req.body.type, location: req.body.location }),
            headers: { 'Content-Type': 'application/json' }
        });

        //convert response to json
        const { id } = await response.json()

        //add policy claim relationship
        response = await fetch(apiURL + '/api/claim', {
            method: 'put',
            body: JSON.stringify({ PolicyNo: req.body.policy, Claim_ID: id }),
            headers: { 'Content-Type': 'application/json' }
        });

        //add driver claim relationship
        response = await fetch(apiURL + '/api/claim', {
            method: 'put',
            body: JSON.stringify({
                PolicyNo: req.body.policy, Claim_ID: id,
                driver: { F_T_Party: req.body.F_T_Party, Percent_At_Fault: req.body.Percent_At_Fault, FName: req.body.driver.FName, LName: req.body.driver.LName }
            }),
            headers: { 'Content-Type': 'application/json' }
        });

        //add vehicle claim relationship
        response = await fetch(apiURL + '/api/claim', {
            method: 'put',
            body: JSON.stringify({ VIN: req.body.vehicle, Claim_ID: id }),
            headers: { 'Content-Type': 'application/json' }
        });

        if (req.session.logType === 'customer') {
            res.redirect('/claims');
        }
        else {
            res.redirect('/manager/claims');
        }
    }
    //if error is returned
    catch (error) {
        console.log(error);
        res.status(400).redirect('/');
    }
});

//view claims page for manager
//call authManager: only managers can access page
app.get('/manager/claims', authManager, async (req, res) => {
    //call api
    try {
        //generate list of claims
        var claims = new Array();

        const response2 = await fetch(apiURL + '/api/claim');
        const claimRes = await response2.json();
        //console.log(claimRes);
        for (const c of claimRes) {
            const response3 = await fetch(apiURL + '/api/claim/view' + `?claimno=${c.ClaimID}`);
            const claim = await response3.json();
            claims.push(claim);
        }


        //console.log(claims);

        res.render('managerClaimView', { claims });
    }
    //if error is returned
    catch (error) {
        console.log(error);
        res.status(400).redirect('/');
    }
});

//get view of a single claim
app.get('/manager/claims/:ClaimID/:PolicyNo', authManager, async (req, res) => {
    const ClaimID = req.params.ClaimID;
    const PolicyNo = req.params.PolicyNo;
    //console.log('calling claims claimid '+req.params.ClaimID);
    //call api
    try {
        //get fetch
        var response = await fetch(apiURL + '/api/policy/view' + `?policyno=${PolicyNo}`);
        //convert response to json
        const policy = await response.json();

        response = await fetch(apiURL + '/api/customer/viewInformation' + `?customerno=${policy[0].CustomerNo}`);
        //convert response to json
        const customer = await response.json();

        //get fetch
        response = await fetch(apiURL + '/api/claim/view' + `?claimno=${ClaimID}`);
        //convert response to json
        const claim = await response.json();

        //get fetch
        response = await fetch(apiURL + '/api/vehicle/' + `${claim.VIN}`);
        //convert response to json
        const vehicle = await response.json();

        //get fetch
        response = await fetch(apiURL + '/api/driver/' + `${claim.License_No}/${claim.License_Prov}/${claim.License_Date.split('T')[0]}`);
        //convert response to json
        const driver = await response.json();

        //console.log()
        // console.log({...(customer[0]), ...claim, vehicle, driver});
        // res.redirect('/manager/claims');
        // return;
        res.render('customer sign up/reviewClaimManager', { ...(customer[0]), ...claim, vehicle, driver });
    }
    //if error is returned
    catch (error) {
        console.log(error);
        res.status(400).redirect('/manager/claims');
    }
});

//get view of a single claim
app.post('/manager/claims/:ClaimID/:PolicyNo', authManager, async (req, res) => {
    const ClaimID = req.params.ClaimID;
    const PolicyNo = req.params.PolicyNo;
    // console.log('calling post manager claims '+req.params.ClaimID);
    // console.log(req.body);
    // res.redirect('/manager/claims');
    // return;
    //call api
    try {
        //add vehicle claim relationship
        const response = await fetch(apiURL + '/api/claim', {
            method: 'patch',
            body: JSON.stringify({ Status: req.body.Status, Claim_ID: ClaimID }),
            headers: { 'Content-Type': 'application/json' }
        });
        res.redirect('/manager/claims');
    }
    //if error is returned
    catch (error) {
        console.log(error);
        res.status(400).redirect('/manager/claims');
    }
});

//file claim view
app.get('/manager/fileClaim', authManager, async (req, res) => {
    //res.render('customer sign up/managerfileClaim');
    try {
        //get fetch
        var response = await fetch(apiURL + '/api/customer');
        //convert response to json
        const customer = await response.json();

        res.render('customer sign up/managerfileClaim', { customer });
    }
    //if error is returned
    catch (error) {
        console.log(error);
        res.status(400).redirect('/manager/claims');
    }
});

//file claim view
app.get('/manager/fileClaim/:CustomerNo', authManager, async (req, res) => {
    //console.log("calling file claim cust no");
    try {
        //get fetch
        var response = await fetch(apiURL + '/api/customer');
        //convert response to json
        const customer = await response.json();

        //get fetch
        const response0 = await fetch(apiURL + '/api/customer/viewInformation' + `?customerno=${req.params.CustomerNo}`);
        //convert response to json
        var cust = await response0.json();

        //console.log(cust);

        //get fetch
        response = await fetch(apiURL + '/api/policy/list' + `?customerno=${req.params.CustomerNo}`);
        //convert response to json
        const policies = await response.json();

        //console.log(policies);

        var drivers = new Array();
        var vehicles = new Array();
        for (const curr of policies) {
            var response2 = await fetch(apiURL + '/api/driver' + `?PolicyNo=${curr.PolicyNo}&ClaimID=`);
            const drvs = await response2.json();
            for (const d of drvs) {
                drivers.push(d);
            }

            response2 = await fetch(apiURL + '/api/vehicle' + `?PolicyNo=${curr.PolicyNo}&ClaimID=`);
            vehs = await response2.json();
            for (const v of vehs) {
                vehicles.push(v);
            }
        };

        cust[0].policy = policies;
        cust[0].driver = drivers;
        cust[0].vehicle = vehicles;

        //console.log(cust);


        res.render('customer sign up/managerfileClaim', { customer, CustomerNo: req.params.CustomerNo, ...(cust[0]) });
    }
    //if error is returned
    catch (error) {
        console.log(error);
        res.status(400).redirect('/manager/claims');
    }
});
//customer change request view
app.get('/customer/changeRequest', authCustomer, async (req, res) => {
    try {
        //get fetch
        const response = await fetch(apiURL + '/api/policy/list' + `?customerno=${req.session.CustomerNo}`);
        //convert response to json
        const policies = await response.json();
        res.render('Customer Menus/ChangeRequestMenu', { 'email': req.session.email, policies });
        return;
    }
    catch (error) {
        console.log(error);
    }
});
app.listen(8080, () => {
    console.log("Listening on port 8080")
});
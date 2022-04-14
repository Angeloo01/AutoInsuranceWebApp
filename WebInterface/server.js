const apiURL = 'http://localhost:3000';
const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
const fetch = require('node-fetch');
const { readdirSync, copyFileSync } = require('fs');
const { response } = require('express');

//Setting up view engine.
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('views/Customer Menus'));
app.use(express.static('views/customer sign up'));
app.use(express.static('views/Policies'));
app.use(express.static('views/VehiclesAndDrivers'));
app.use(express.urlencoded({ extended: true })); //to parse HTML form data (aka read HTML form data)
app.use(express.static(path.join(__dirname, '/public')));
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
    res.status(401).redirect("/");
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
    res.status(401).redirect("/");
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
    res.status(401).redirect("/");
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
        // console.log(policies);
        // console.log(claims);

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

        //console.log({...(customer[0]), ...claim, vehicle});

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
                console.log("YO");
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
            body: JSON.stringify({ accident_date: req.body.accident_date, status: 'PENDING', type: req.body.type, location: req.body.location }),
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
//customer list policies get request, renders the list policies menu
app.get('/customer/listPolicies', authCustomer, async (req, res) => {
    try {
        //get fetch
        const response = await fetch(apiURL + '/api/policy/list' + `?customerno=${req.session.CustomerNo}`);
        //convert response to json
        const policies = await response.json();
        //render the page and pass the customer's email address
        res.render('Policies/CustomerPolicies', { 'email': req.session.email, policies });
        return;
    }
    catch (error) {
        console.log(error);
    }
});
//customer view information get request, accessed from inside the customer menu
app.get('/customer/information', authCustomer, async (req, res) => {
    try {
        //get all the customer's information
        const response = await fetch(apiURL + '/api/customer/viewInformation' + `?customerno=${req.session.CustomerNo}`);
        //convert response to json
        const information = await response.json();
        res.render('Customer Menus/CustomerInformation', { 'email': req.session.email, information });
    }
    catch (error) {
        console.log(error);
    }
})
//customer edit information get request, accessed from customer information menu
app.get('/customer/editInformation', authCustomer, async (req, res) => {
    try {
        //fetch the api url for viewing information, pass in customer no as parameter
        const response = await fetch(apiURL + '/api/customer/viewInformation' + `?customerno=${req.session.CustomerNo}`);
        //convert response to json
        const information = await response.json();
        res.render('Customer Menus/CustomerEditInfo', { 'email': req.session.email, information });
    }
    catch (error) {
        console.log(error);
    }

});
//post request to edit customer information, accessed once customer edit information form is submitted.
app.post('/customer/editInformation', async (req, res) => {
    try {
        //fetch the url, and pass in customer number as a url parameter
        var response = await fetch((apiURL + '/api/customer' + `?customerno=${req.session.CustomerNo}`), {
            method: 'put', //make methid = put since the api endpoint is a PUT request
            body: JSON.stringify(req.body), //everything is already in correct order from form, so just json.stringify the entire request
            headers: { 'Content-Type': 'application/json' }
        });
        res.redirect('/customer/information'); //redirect back to information page to view changes
    }
    catch (error) {
        console.log(error);
    }
});

//manager policies view
app.get('/manager/policies', authManager, async (req, res) => {
    try {
        //get fetch
        var response = await fetch(apiURL + '/api/policy/all');
        const policies = await response.json();

        //console.log(policies);
        res.render('Policies/ManagerViewAllPolicies', { policies });

    }
    catch (error) {
        console.log(error);
        res.status(400).redirect('/');
    }
});

//manager specific policy view
app.get('/manager/policies/:PolicyNo', authManager, async (req, res) => {
    try {
        //get fetch
        var response = await fetch(apiURL + `/api/policy/view?policyno=${req.params.PolicyNo}`);
        const policy = (await response.json())[0];

        //console.log(policies);
        res.render('Policies/managerViewPolicy', { ...policy });

    }
    catch (error) {
        console.log(error);
        res.status(400).redirect('/');
    }
});

//manager update policy post
app.post('/manager/policies/:PolicyNo', authManager, async (req, res) => {
    //console.log(req.body);
    try {
        var response = await fetch((apiURL + `/api/policy/${req.params.PolicyNo}`), {
            method: 'patch', //
            body: JSON.stringify({ deductible: req.body.deductible, edate: req.body.edate, status: req.body.status, premium: req.body.premium }), //
            headers: { 'Content-Type': 'application/json' }
        });

        //console.log(policies);
        res.redirect(`/manager/policies/${req.params.PolicyNo}`);

    }
    catch (error) {
        console.log(error);
        res.status(400).redirect('/');
    }
});

//manager view notes
app.get('/manager/policies/notes/:PolicyNo', authManager, async (req, res) => {
    try {
        //get fetch
        var response = await fetch(apiURL + `/api/note?policyno=${req.params.PolicyNo}`);
        const notes = await response.json();

        //console.log(notes);
        res.render('Notes/ViewNotes', { PolicyNo: req.params.PolicyNo, notes });

    }
    catch (error) {
        console.log(error);
        res.status(400).redirect('/');
    }
});

//add note manager
app.get('/manager/policies/newNote/:PolicyNo', authManager, async (req, res) => {
    try {
        //get fetch
        // var response = await fetch(apiURL + `/api/note?policyno=${req.params.PolicyNo}`);
        // const notes = await response.json();

        //console.log(notes);
        res.render('Notes/NewNote', { PolicyNo: req.params.PolicyNo });

    }
    catch (error) {
        console.log(error);
        res.status(400).redirect('/');
    }
});

//add note manager
app.post('/manager/policies/newNote/:PolicyNo', authManager, async (req, res) => {
    try {
        //post fetch
        //req.body.policyno, req.body.note_title, req.body.date, req.body.text, req.body.ManagerID
        var date;
        date = new Date();
        date = date.getUTCFullYear() + '-' +
            ('00' + (date.getUTCMonth() + 1)).slice(-2) + '-' +
            ('00' + date.getUTCDate()).slice(-2) + ' ' +
            ('00' + date.getUTCHours()).slice(-2) + ':' +
            ('00' + date.getUTCMinutes()).slice(-2) + ':' +
            ('00' + date.getUTCSeconds()).slice(-2);
        var response = await fetch((apiURL + '/api/note'), {
            method: 'post', //make methid = put since the api endpoint is a POST request
            body: JSON.stringify({ policyno: req.params.PolicyNo, note_title: req.body.Title, date: date, text: req.body.Text, ManagerID: req.session.ManagerID }), //everything is already in correct order from form, so just json.stringify the entire request
            headers: { 'Content-Type': 'application/json' }
        });

        //console.log(req.body);
        res.redirect(`/manager/policies/notes/${req.params.PolicyNo}`);

    }
    catch (error) {
        console.log(error);
        res.status(400).redirect('/');
    }
});
app.get('/customer/newPolicy', authCustomer, async (req, res) => {
    try {
        res.render('Customer Menus/CustomerPolicyRequest', { 'email': req.session.email });
    }
    catch (error) {
        console.log(error);
    }
});
app.post('/customer/newPolicy', authCustomer, async (req, res) => {
    try {
        //fetch the url, and pass in customer number as a url parameter
        var response = await fetch((apiURL + '/api/policy' + `?customerno=${req.session.CustomerNo}`), {
            method: 'post',
            body: JSON.stringify({ deductible: req.body.Deductible, edate: req.body.Date, status: "PENDING MANAGER REVIEW", premium: req.body.Premium }),
            headers: { 'Content-Type': 'application/json' }
        });
        res.redirect('/'); //redirect back to information page to view changes
    }
    catch (error) {
        console.log(error);
    }
});
app.get('/customer/PolicyPage/:PolicyNo', authCustomer, async (req, res) => {
    try {
        const response = await fetch(apiURL + '/api/policy/view' + `?policyno=${req.params.PolicyNo}`);
        //convert response to json
        const information = await response.json();
        res.render('Policies/PolicyPage', { 'email': req.session.email, information });
    }
    catch (error) {
        console.log(error);
    }
});

//get PinkCard page
app.get('/customer/pinkcard/:PolicyNo', authCustomer, async (req, res) => {
    //console.log("calling pinkcard");
    try {
        var response = await fetch(apiURL + '/api/policy/view' + `?policyno=${req.params.PolicyNo}`);
        //convert response to json
        const policy = (await response.json())[0];

        response = await fetch(apiURL + '/api/vehicle' + `?PolicyNo=${req.params.PolicyNo}&ClaimID=`);
        const vehicles = await response.json();

        res.render('PinkCard/ViewPinkCard', { ...policy, vehicles });
    }
    catch (error) {
        console.log(error);
        res.status(400).redirect('/');
    }
});

//customer list policies get request, renders the list policies menu
app.get('/customer/payments', authCustomer, async (req, res) => {
    try {
        //get fetch
        var response = await fetch(apiURL + '/api/policy/list' + `?customerno=${req.session.CustomerNo}`);
        //convert response to json
        var policies = await response.json();

        for (p of policies) {
            response = await fetch(apiURL + '/api/payment' + `?policyno=${p.PolicyNo}`);
            //convert response to json
            p.payments = await response.json();
        }
        //console.log(policies);
        res.render('Payments/ViewPayments', { policies });
        return;
    }
    catch (error) {
        console.log(error);
        res.status(400).redirect('/');
    }
});
app.get('/customer/vehicles/:PolicyNo', authCustomer, async (req, res) => {
    try {
        var response = await fetch(apiURL + '/api/policy/view' + `?policyno=${req.params.PolicyNo}`);
        //convert response to json
        const policy = await response.json();

        response = await fetch(apiURL + '/api/vehicle' + `?PolicyNo=${req.params.PolicyNo}&ClaimID=`);
        const vehicles = await response.json();

        res.render('VehiclesAndDrivers/vehicleHomePage.ejs', { 'email': req.session.email, policy, vehicles });
    }
    catch (error) {
        console.log(error);
    }
});
app.get('/customer/viewVehicle/:VIN/:PolicyNo', authCustomer, async (req, res) => {
    try {
        var response = await fetch(apiURL + `/api/vehicle/${req.params.VIN}`);

        const information = await response.json();

        response = await fetch(apiURL + '/api/policy/view' + `?policyno=${req.params.PolicyNo}`);
        //convert response to json
        const policy = await response.json();

        response = await fetch(apiURL + '/api/driver/drives');
        const drives = await response.json();

        var drivers = new Array();
        var response2 = await fetch(apiURL + '/api/driver' + `?PolicyNo=${req.params.PolicyNo}&ClaimID=`);
        const drvs = await response2.json();
        for (const d of drvs) {
            for (const dr of drives) {
                if ((d.License_No === dr.License_No) && (dr.VIN === information.VIN)) {
                    drivers.push(d);
                }
            }
        }
        res.render('VehiclesAndDrivers/vehicleInfoPage', { 'email': req.session.email, information, policy, drivers });
    }
    catch (error) {
        console.log(error);
    }
});
app.get('/customer/addVehicle/:PolicyNo', authCustomer, async (req, res) => {
    try {
        let policyNo = req.params.PolicyNo;
        res.render('VehiclesAndDrivers/registerVehiclePage', { 'email': req.session.email, policyNo });
    }
    catch (error) {
        console.log(error);
    }
});
app.post('/customer/addVehicle/:PolicyNo', authCustomer, async (req, res) => {
    let pNo = req.params.PolicyNo;
    try {
        var response = await fetch((apiURL + '/api/vehicle'), {
            method: 'post',
            body: JSON.stringify({
                VIN: req.body.VIN, year: req.body.Year, make: req.body.Make, model: req.body.Model, uses: req.body.Usage, km: req.body.kmperyr,
                lease_status: req.body.LeaseStatus, driving_record: req.body.DrivingRecord
            }),
            headers: { 'Content-Type': 'application/json' }

        });
        var response = await fetch((apiURL + '/api/insd_under'), {
            method: 'post',
            body: JSON.stringify({
                VIN: req.body.VIN, policyno: pNo
            }),
            headers: { 'Content-Type': 'application/json' }

        });
        res.redirect(`/customer/viewVehicle/${VIN}/${pNo}`);
    }
    catch (error) {
        console.log(error);
    }
});
app.get('/customer/vehicle/addDriver/:VIN/:PolicyNo', authCustomer, async (req, res) => {
    try {
        let VIN = req.params.VIN;
        let pNo = req.params.PolicyNo;
        res.render('VehiclesAndDrivers/NewDriverPage', { 'email': req.session.email, VIN, pNo });
    }
    catch (error) {
        console.log(error);
    }
});
app.post('/customer/vehicle/addVehicle/:VIN/:PolicyNo', authCustomer, async (req, res) => {
    let VIN = req.params.VIN;
    let pNo = req.params.PolicyNo;
    try {
        var response = await fetch((apiURL + '/api/driver'), {
            method: 'post',
            body: JSON.stringify({
                license_date: req.body.LicenseDate, license_no: req.body.LicenseNumber, license_prov: req.body.licenseProv, fname: req.body.fName, mname: req.body.mName, lname: req.body.lName,
                training: req.body.Training, sex: req.body.sex, birth_date: req.body.bDate, grid_rating: req.body.GridRating, license_class: req.body.LicenseClass
            }),
            headers: { 'Content-Type': 'application/json' }

        });
        var response = await fetch((apiURL + '/api/driver/drives'), {
            method: 'post',
            body: JSON.stringify({
                licensedate: req.body.LicenseDate, licenseno: req.body.LicenseNumber, licenseprov: req.body.licenseProv, vin: VIN, po: req.body.po
            }),
            headers: { 'Content-Type': 'application/json' }
        });
        var response = await fetch((apiURL + '/api/driver/driverfor'), {
            method: 'post',
            body: JSON.stringify({
                licensedate: req.body.LicenseDate, licenseno: req.body.LicenseNumber, licenseprov: req.body.licenseProv, pno: pNo, relationship: req.body.relationship
            }),
            headers: { 'Content-Type': 'application/json' }
        });
        res.redirect(`/customer/vehicles/${pNo}`);
    }
    catch (error) {
        console.log(error);
    }
});
app.listen(8080, () => {
    console.log("Listening on port 8080")
});
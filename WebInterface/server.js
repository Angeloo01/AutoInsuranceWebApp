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
    if (req.session.email) {
        res.render('Customer Menus/CustomerMenu', { 'email': req.session.email });
        return;
    }
    res.render('front page');
});

//load page for sign up
app.get('/signup', (req, res) => {
    res.render('customer sign up/signup');
});

//endpoint for post new user
app.post('/signup', async (req, res) => {
    const {firstName, middleName, lastName, email, password, phone, sex,
            birthday, address, country, province, zip} = req.body;
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
        res.status(401).render('front page', {'badCred': true});
    }

});

//logout user
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

//view claims page for customer
app.get('/claims', authCustomer, async (req, res) => {
    //call api
    try {
        //get fetch
        const response = await fetch(apiURL + '/api/policy/list'+`?customerno=${req.session.CustomerNo}`);
        //convert response to json
        const policies = await response.json();

        var claims = new Array();
        for(const curr of policies){
            const response2 = await fetch(apiURL + '/api/claim'+`?PolicyNo=${curr.PolicyNo}`);
            const claimRes = await response2.json();

            for(const c of claimRes){
                const response3 = await fetch(apiURL + '/api/claim/view'+`?claimno=${c.ClaimID}`);
                const claim = await response3.json();
                claims.push(claim);
            }
        };

        //console.log(claims);

        res.render('customerClaimView', {claims});
    }
    //if error is returned
    catch (error) {
        console.log(error);
        res.status(400).redirect('/');
    }
});

app.listen(8080, () => {
    console.log("Listening on port 8080")
});
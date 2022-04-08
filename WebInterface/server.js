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
app.post('/signup', (req, res) => {
    const {firstName, middleName, lastName, email, password, phone, sex,
            birthday, address, country, province, zip} = req.body;
    //console.log(req.body);
});

//endpoint to test authCustomer
app.get('/tryCustomerOnly', authCustomer, (req, res) => {
    res.send("hello customer");
});

//endpoint to test authManager
app.get('/tryManagerOnly', authManager, (req, res) => {
    res.send("hello manager");
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
        res.status(401).redirect('/');
    }

});

//logout user
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.listen(8080, () => {
    console.log("Listening on port 8080")
});
const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
const { readdirSync } = require('fs');

//Setting up view engine.
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true })) //to parse HTML form data (aka read HTML form data)
//app.use(express.static(path.join(__dirname, '/public')));
app.use(express.json());
app.use(session({
    secret: 'secretforcpsc371autoinsurancewebapp',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 },//60 minutes
    rolling: true
}));

function authCustomer (req, res, next) {
    if(req.session.logType){
        if(req.session.logType === 'customer') {
            next();
            return;
        }
    }
    res.status(401).send("You must log in first!");
    return;
}

function authManager (req, res, next) {
    if(req.session.logType){
        if(req.session.logType === 'manager') {
            next();
            return;
        }
    }
    res.status(401).send("You must log in first!");
    return;
}

app.get('/', (req, res) => {
    let testData = [1, 2, 3, 4];
    if(req.session.email){
        res.send(`<!DOCTYPE html>
        <html lang="en">
        
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Home Page</title>
        </head>
        
        <body>
            <h1>Hi ${req.session.email}
            </h1>
            <a href="/logout">
                <button>Logout</button>
            </a>
        
        
        </body>
        
        </html>`);
        return;
    }
    res.render('front page');
});

app.get('/tryCustomerOnly', authCustomer, (req, res) => {
    res.send("hello customer");
});
app.get('/tryManagerOnly', authManager, (req, res) => {
    res.send("hello manager");
});

//post method to login
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    req.session.CustNo = 0;
    req.session.email = email;
    req.session.logType = 'customer';
    res.redirect('/');
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.listen(8080, () => {
    console.log("Listening on port 8080")
});
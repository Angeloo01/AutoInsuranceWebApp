const express = require('express');
const app = express();
const path = require('path');

app.get('/', (req, res) => {
    let testData = [1, 2, 3, 4];
    res.render('home', { "testData": testData });
});

//Setting up view engine.
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.listen(8080, () => {
    console.log("Listening on port 8080")
});
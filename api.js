const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors())

app.get('/', function (req, res, next) {
    res.send('Hello World!');
})

app.get('/throw-404', function (req, res, next) {
    res.status(404).send('Custom 404 Error Message');
})

app.get('/throw-401', function (req, res, next) {
    res.status(401).send();
})

app.listen(3000, function () {
    console.log('Api running on port 3000')
})
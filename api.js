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

app.post('/logout', function (req, res, next) {
    res.status(200).send();
})

app.post('/refresh-token', function (req, res, next) {
    res.status(200).send();
})

app.post('/2fa/turn-on', function (req, res, next) {
    res.json({ url: 'otpauth://totp/ngx-material-auth?secret=secret' });
})

app.post('/2fa/confirm-turn-on', function (req, res, next) {
    console.log(req.headers['X-Authorization-2FA']);
    res.status(200).send();
})

app.listen(3000, function () {
    console.log('Api running on port 3000')
})
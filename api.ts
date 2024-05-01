
/* eslint-disable no-console */
import * as cors from 'cors';
import { Express } from 'express';
import * as express from 'express';

import { authData, correctLoginData, refreshAccessToken, refreshRefreshToken } from './api-data';
import { LoginData } from './projects/ngx-material-auth/src/public-api';

const app: Express = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/throw-404', (req, res) => {
    res.status(404).send('Custom 404 Error Message');
});

app.get('/throw-401', (req, res) => {
    res.status(401).send();
});

app.post('/login', (req, res) => {
    const loginData: LoginData = req.body as LoginData;
    if (loginData.email === correctLoginData.email && loginData.password === correctLoginData.password) {
        refreshRefreshToken();
        refreshAccessToken();
        res.status(200).send(authData);
        return;
    }
    res.status(401).send();
});

app.post('/logout', (req, res) => {
    res.status(200).send();
});

app.post('/refresh-token', (req, res) => {
    refreshAccessToken();
    res.status(200).send(authData);
});

app.post('/2fa/turn-on', (req, res) => {
    res.json({ url: 'otpauth://totp/ngx-material-auth?secret=secret' });
});

app.post('/2fa/confirm-turn-on', (req, res) => {
    console.log(req.headers['X-Authorization-2FA']);
    res.status(200).send();
});

app.listen(3000, () => {
    console.log('Api running on port 3000');
});
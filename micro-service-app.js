const express = require('express');
const request = require('request-promise');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
app.use(bodyParser.json());

app.get('/api/*', (req, res, next) => {
  console.log('in microservice - get');
  const jwtToken = jwt.verify(req.headers['token'], 'shhhhh');
  console.log('jwt token:', jwtToken);
  res.locals.token = jwtToken;
  next();
}, (req, res) => {
  let token = res.locals.token;
  delete token.user.password;
  delete token.user.userApiToken;
  delete token.iat;
  res.send(token);
  }
);

app.delete('/api/*', (req, res, next) => {
  console.log('in microservice - delete');
  const jwtToken = jwt.verify(req.headers['token'], 'shhhhh');
  console.log('jwt token:', jwtToken);
  res.locals.token = jwtToken;
  next();
}, (req, res) => {
  let token = res.locals.token;
  delete token.user.password;
  delete token.user.userApiToken;
  delete token.iat;
  res.send(token);
  }
);

module.exports = app;

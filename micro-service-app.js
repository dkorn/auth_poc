const express = require('express');
const request = require('request-promise');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
app.use(bodyParser.json());

app.get('/api/*', (req, res, next) => {
  console.log('in microservice');
  const token = jwt.verify(req.headers['token'], 'shhhhh');
  console.log('jwt token:', token);
  next();
}, (req, res) => res.send('hello'));

app.delete('/api/*', (req, res, next) => {
  console.log('in microservice');
  const token = jwt.verify(req.headers['token'], 'shhhhh');
  console.log('jwt token:', token);
  next();
}, (req, res) => res.send('hello'));

module.exports = app;

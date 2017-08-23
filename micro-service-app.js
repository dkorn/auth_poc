const express = require('express');
const request = require('request-promise');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

app.get('/api/*', (req, res, next) => {
  console.log('in microservice');
  console.log(req.headers);
  next();
}, (req, res) => res.send('hello'));

app.delete('/api/*', (req, res, next) => {
  console.log('in microservice');
  console.log(req.headers);
  next();
}, (req, res) => res.send('hello'));

module.exports = app;

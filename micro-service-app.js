const express = require('express');
const request = require('request-promise');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const authenticatedRoute = (req, res) => res.send('hello you authenticated you');

const authMiddleWare = (neededPolicy) =>
  (req, res, next) => {
    const authHeader = req.headers['bp-wtf'];
    const neededPolicyWithIDs = neededPolicy;
    if (neededPolicy.resource) {
      neededPolicyWithIDs.resource.id = req.params.id;
    }
    console.log('in auth middleware', authHeader, neededPolicyWithIDs);
    return request.post({
      uri: 'http://localhost:1448/authenticate',
      json: true,
      resolveWithFullResponse: true,
      body: {
        authHeader,
        neededPolicy: neededPolicyWithIDs
      }
    })
    .then((response) => {
      if (response.statusCode === 200) {
        console.log('authenticated by auth service');
        return next();
      }
      console.log('not authenticated', response.statusCode);
      return res.status(403).send('Not authenticated');
    })
    .catch((err) => {
      console.log('error from auth service', err.statusCode);
      res.status(err.statusCode).send('Auth error');
    });
  };

app.get('/hello', (req, res, next) => {
  console.log('in middleware');
  next();
}, (req, res) => res.send('hello'));

app.get('/environment/:id', authMiddleWare({
        resource: {
          type: 'environment'
        },
        permissions: [
          'environment@read'
        ]
      }
), authenticatedRoute);

module.exports = app;

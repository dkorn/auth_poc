const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

app.post('/authenticate', (req, res) => {
  const authenticated = req.body.authHeader === 'aaa';
  if (!authenticated) {
    console.log('not authenticated');
    return res.status(403).end();
  }
  const authorized = req.body.neededPolicy.resource.id === '123';
  if (!authorized) {
    console.log('not authorized');
    return res.status(403).end();
  }
  console.log('zomg all ok!!1');
  res.status(200).end();
});

module.exports = app;

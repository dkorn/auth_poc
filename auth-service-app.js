const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
let acl = require('acl');

const app = express();
app.use(bodyParser.json());
acl = new acl(new acl.memoryBackend());

const permissions = {GET: 'read', POST: 'create', PUT: 'update', DELETE: 'delete'};

const mockUsersdDb = [
  {userId: 'adminUser', password: 'secret', role: 'Admin', userApiToken: 'aaa'},
  {userId: 'regularUser', password: 'secret', role: 'User', userApiToken: 'bbb'}
];

acl.addUserRoles('adminUser', 'Admin');
acl.addUserRoles('regularUser', 'User');
acl.allow([
  {
    roles: ['Admin'],
    allows: [
      { resources: 'incidents', permissions: '*' },
      { resources: 'users', permissions: '*' }
    ]
  },
  {
    roles: ['User'],
    allows: [
      { resources: 'incidents', permissions: 'read' },
      { resources: 'users', permissions: 'read' }
    ]
  }
]);

function findUserByToken(token) {
  return mockUsersdDb.find((user) => user.userApiToken === token);
}

function authenticateUser(req) {
  const token = req.headers['authorization'];
  return Promise.resolve(findUserByToken(token));
}

function authentication(req, res, next) {
  console.log('Authenticating...');
  authenticateUser(req).then((authenticated) => {
    if (!authenticated) {
      console.log('Not Authenticated!')
      return res.status(401).end();
    }
    console.log('Authenticated by auth service!');
    next()
  });
}

function getUserRole(token) {
  return findUserByToken(token).role;
}

function isAllowed(userId, resource, permission) {
  return acl.isAllowed(userId, resource, permission);
}

function authorizeAction(req) {
  const user = findUserByToken(req.headers['authorization']);
  const method = req.headers['x-original-method'];
  const resource = req.params.resource;
  let permission;
  if (req.params.id) {
    const resourceId = req.params.id;
  }
  if (method == 'GET') {
    permission = 'read';
  } else {
    permission = permissions[method];
  }
  return isAllowed(user.userId, resource, permission).then((authorized) => authorized);
}

function generateToken(req) {
  const token = req.headers['authorization'];
  const userRole = getUserRole(token);
  const jwtToken = jwt.sign({ role: userRole }, 'shhhhh');
  return jwtToken;
}

function authorization(req, res, next) {
  console.log('Authorizing...');
  authorizeAction(req).then((authorized) => {
    if (!authorized) {
      console.log('Not Authorized!')
      return res.status(403).end();
    }
    console.log('Authorized by auth service!');
    const jwtToken = generateToken(req); 
    res.header('token', jwtToken);
    res.status(200).end();
  });
}

app.use('/api/:resource/:id/:subresource', authentication, authorization);
app.use('/api/:resource/:id', authentication, authorization);
app.use('/api/:resource', authentication, authorization);

module.exports = app;

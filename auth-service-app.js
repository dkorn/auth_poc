const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
let acl = require('acl');

const app = express();
app.use(bodyParser.json());
acl = new acl(new acl.memoryBackend());

const permissions = {GET: 'read', POST: 'create', PUT: 'update', DELETE: 'delete'};

const mockUsersdDb = [
  {id: 'administrator', password: 'secret', role: 'Admin', userApiToken: 'aaa'},
  {id: 'operator', password: 'secret', role: 'User', userApiToken: 'bbb'}
];

acl.addUserRoles('administrator', 'Admin');
acl.addUserRoles('operator', 'User');
acl.allow([
  {
    roles: ['Admin'],
    allows: [
      { resources: ['incidents', 'incidents/1', 'incidents/2', 'incidents/3',], permissions: ['read', 'create', 'edit', 'delete'] },
      { resources: ['users'], permissions:['read', 'create', 'edit', 'delete'] }
    ]
  },
  {
    roles: ['User'],
    allows: [
      { resources: ['incidents', 'incidents/1'], permissions: 'read' },
      { resources: ['incidents/2'], permissions: ['read', 'create', 'edit', 'delete'] },
      { resources: ['users'], permissions: 'read' }
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

function authorizeAction(req, user, method) {
  const permission = permissions[method];
  let resource = req.params.resource;
  if (req.params.id) {
    resource = resource + '/' + req.params.id;
  }
  return isAllowed(user.id, resource, permission).then((authorized) => authorized);
}

function generateToken(user, resources) {
  let jwtToken;
  if (resources) {
    jwtToken = jwt.sign({ user: user, resources: resources }, 'shhhhh');
  } else {
    jwtToken = jwt.sign({ user: user }, 'shhhhh');
  }
  return jwtToken;
}

function getResourcesIds(resources, resourceCollection) {
  let idsList = [];
  for (resource in resources) {
    if (resource.indexOf(resourceCollection + '/') === 0 ) {
      idsList.push(resource.split(resourceCollection + '/')[1]);
    }
  }
  return idsList;
}

function authorization(req, res, next) {
  console.log('Authorizing...');
  const token = req.headers['authorization'];
  const user = findUserByToken(token);
  const method = req.headers['x-original-method'];
  let resourcesIds = [];
  let jwtToken;
  authorizeAction(req, user, method).then((authorized) => {
    if (!authorized) {
      console.log('Not Authorized!')
      return res.status(403).end();
    }
    console.log('Authorized by auth service!');
    if (method !== 'GET' || req.params.id) {
      jwtToken = generateToken(user);
      res.header('token', jwtToken);
      res.status(200).end();
    } else {
      // read request for the entire resource collection, requires permissions per resource
      acl.whatResources(user.role, (err, resources) => {
        resourcesIds = getResourcesIds(resources, req.params.resource);
        jwtToken = generateToken(user, resourcesIds);
        res.header('token', jwtToken);
        return res.status(200).end();
      });
    }
  });
}

app.use('/api/:resource/:id/:subresource', authentication, authorization);
app.use('/api/:resource/:id', authentication, authorization);
app.use('/api/:resource', authentication, authorization);

module.exports = app;

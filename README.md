# auth_poc
Access Management POC

## Getting Started

```shell
npm install

cd nginx
vagrant up
vagrant ssh
sudo chown vagrant:vagrant /usr/local/nginx/conf/
logout
vagrant plugin install vagrant-scp
vagrant scp nginx.conf default:/usr/local/nginx/conf/nginx.conf
```

## Running

micro services:
```shell
node index.js
```

NGINX:
```shell
vagrant ssh
sudo /usr/local/nginx/sbin/nginx
```

Or even better, with [nodemon](https://github.com/remy/nodemon)
```shell
npm install -g nodemon
nodemon index.js
```

### Ports used:

* micro service       1447
* auth service        1448
* NGINX reverse proxy 1449

## Usage Example (using http)

```shell
http localhost:1449/api/incidents Authorization:aaa
http localhost:1449/api/incidents/1 Authorization:bbb
```

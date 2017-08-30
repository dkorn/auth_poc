sudo apt-get update

sudo apt-get install libpcre3-dev zlib1g-dev libssl-dev

wget http://nginx.org/download/nginx-1.13.4.tar.gz

tar zxf nginx-1.13.4.tar.gz

cd nginx-1.13.4

./configure --with-http_auth_request_module

make

sudo make install

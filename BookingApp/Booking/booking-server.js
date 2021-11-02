const http = require('http');
const app = require('./app');
const server = http.createServer(app);

var express = require('express')
var appp = express() 
appp.get('/', function (req, res) {
    res.send('hello world 7001')
  })

PORT = process.env.PORT || 7002

server.listen(PORT, () => {
    console.log("server is ruunning on : http://localhost:" + PORT);
})
const PORT = 3000;
const express = require('express');
const server = express();
const {client} = require('./db')
client.connect()

server.listen(PORT, () => {
  console.log('The server is up on port', PORT)
});
// we'll use morgan to log out each incoming request instead of having to manually write logs 
const morgan = require("morgan");
// this will show the method, the route, the HTTP response code, and how long it took to form
server.use(morgan("dev"));
// this reads incoming JSON from requests (request's header has to be Content-Type: application/json)
server.use(express.json())

server.use((req, res, next) => {
    console.log("<____Body Logger START____>");
    console.log(req.body);
    console.log("<_____Body Logger END_____>");
  
    next();
  });

  /* these routes will be defined:
    POST /api/users/register
    POST /api/users/login
    DELETE /api/users/:id

    GET /api/posts
    POST /api/posts
    PATCH /api/posts/:id
    DELETE /api/posts/:id

    GET /api/tags
    GET /api/tags/:tagName/posts
  */

const apiRouter = require('./api');
server.use('/api', apiRouter)












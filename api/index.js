const express = require('express');
const apiRouter = express.Router();
const postsRouter = require('./posts');
const usersRouter = require('./users');
apiRouter.use('/users', usersRouter, postsRouter);

module.exports = apiRouter;






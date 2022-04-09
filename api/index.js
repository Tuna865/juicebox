const express = require('express');
const jwt = require('jsonwebtoken');
const { getUserById } = require('../db');
const { JWT_SECRET } = process.env;
const apiRouter = express.Router();
const postsRouter = require('./posts');
const usersRouter = require('./users');
const tagsRouter = require('./tags');

apiRouter.use(async (req, res, next) => {
    const prefix = 'Bearer ';
    const auth = req.header('Authorization');
    // if the auth header wasnt set
    if (!auth) { // nothing to see here
      next();
    //  if auth was set and begins with a Bearer followed by a space (prefix):
    // if successful verification try to read the user from the database 
    // if failed verify throws error (in the catch block)
    } else if (auth.startsWith(prefix)) {
      const token = auth.slice(prefix.length);
  
      try {
        const { id } = jwt.verify(token, JWT_SECRET);
        console.log(id)
  
        if (id) {
          req.user = await getUserById(id);
          next();
        }
      } catch ({ name, message }) {
        next({ name, message });
      }
    //   user set a header but it wasnt formed correctly
    } else {
      next({
        name: 'AuthorizationHeaderError',
        message: `Authorization token must start with ${ prefix }`
      });
    }
  });
apiRouter.use((req, res, next) => {
    if (req.user) {
      console.log("User is set:", req.user);
    }
    next();
  });

apiRouter.use('/users', usersRouter);
apiRouter.use('/posts', postsRouter);
apiRouter.use('/tags', tagsRouter);
apiRouter.use((error, req, res, next) => {
    res.send({
        name: error.name,
        message: error.message
    });
})
module.exports = apiRouter;






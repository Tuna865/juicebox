const express = require("express")
const usersRouter = express.Router()
const jwt = require('jsonwebtoken')
const {getUserByUsername, createUser} = require('../db')
// use Router to create a new router and export it 
usersRouter.use((req, res, next) => {
    console.log("request being made to /users");
    next()
})
// import getAllUsers from the db folder (must be .. instead of ...)
const {getAllUsers} = require('../db')

// fires whenever a GET request is made to /api/users
// returns an object with an empty array 
usersRouter.get('/', async (req, res) => {
    const users = await getAllUsers()
    res.send({
        users
    });
});
usersRouter.post('/login', async (req, res, next) => {
    const { username, password } = req.body;
  
    // the request must have both for it to work
    if (!username || !password) {
      next({
        name: "MissingCredentialsError",
        message: "Please supply both a username and password"
      });
    }
  
    try {
      const user = await getUserByUsername(username);
  
      if (user && user.password == password) {
        // create token & return to user
        console.log("process.env.JWT_SECRET",process.env.JWT_SECRET)
        const token = jwt.sign({ id: user.id, username: username }, process.env.JWT_SECRET,{
            expiresIn: '1w'
          } );
        console.log("token",token)
        const verifiedData = jwt.verify(token, process.env.JWT_SECRET)
        console.log("verifiedData",verifiedData)
        console.log("sending token...")
        // res.send(token)
        res.send({token, message: "you are logged in"});
      } else {
        next({ 
          name: 'IncorrectCredentialsError', 
          message: 'username or password is incorrect'
        });
      }
    } catch(error) {
      console.log(error);
      next(error);
    }
  });

usersRouter.post('/register', async (req, res, next) => {
    const { username, password, name, location } = req.body;
  
    try {
      const _user = await getUserByUsername(username);
  
      if (_user) {
        next({
          name: 'UserExistsError',
          message: 'A user by that username already exists'
        });
      }
  
      const user = await createUser({
        username,
        password,
        name,
        location,
      });
  
      const token = jwt.sign({ 
        id: user.id, 
        username
      }, process.env.JWT_SECRET, {
        expiresIn: '1w'
      });
  
      res.send({ 
        message: "thank you for signing up",
        token 
      });
    } catch ({ name, message }) {
      next({ name, message })
    } 
  });
  

module.exports = usersRouter





const express = require("express")
const usersRouter = express.Router()
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
module.exports = usersRouter





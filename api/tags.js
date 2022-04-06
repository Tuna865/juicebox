const express = require("express")
const tagsRouter = express.Router()
// use Router to create a new router and export it 
tagsRouter.use((req, res, next) => {
    console.log("request being made to /tags");
    next()
})
// import getAllUsers from the db folder (must be .. instead of ...)
const {getAllTags} = require('../db')

// fires whenever a GET request is made to /api/tags
// returns an object with an empty array 
tagsRouter.get('/', async (req, res) => {
    const tags = await getAllTags()
    res.send({
        tags
    });
});
module.exports = tagsRouter
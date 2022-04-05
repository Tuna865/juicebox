const express = require("express")
const postsRouter = express.Router()
// use Router to create a new router and export it 
postsRouter.use((req, res, next) => {
    console.log("request being made to /users");
    next()

})
// import getAllUsers from the db folder
const {getAllPosts} = require('../db')

// fires whenever a GET request is made to /api/posts
// returns an object with an empty array 
postsRouter.get('/', async (req, res) => {
    const posts = await getAllPosts()
    res.send({
        posts: []
    });
});



module.exports = postsRouter
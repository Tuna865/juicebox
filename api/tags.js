const express = require("express")
const tagsRouter = express.Router()
const {getAllTags, getPostsByTagName} = require('../db')
// use Router to create a new router and export it 
tagsRouter.use((req, res, next) => {
    console.log("request being made to /tags");
    next()
})
// fires whenever a GET request is made to /api/tags
// returns an object with an empty array 
tagsRouter.get('/', async (req, res) => {
    const tags = await getAllTags()
    res.send({
        tags
    });
});
tagsRouter.get('/:tagName/posts', async (req, res, next)=> {

    try{
        console.log("retrieving tagged posts...")
        const taggedPosts = await getPostsByTagName()
        console.log("taggedPosts:", taggedPosts)
        res.send({posts: taggedPosts})

    }catch({name, message}){
        next({ name, message })
    }
})
module.exports = tagsRouter
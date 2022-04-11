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
// not quite sure this works but the inactive post does not show up 
tagsRouter.get('/:tagName/posts', async (req, res, next)=> {
    const { tagName } = req.params
    try{
        console.log("retrieving tagged posts...")
        const activePosts = allPosts.filter(post => {
            return post.active || (req.user && post.author.id === req.user.id);
          });
        const taggedPosts = await getPostsByTagName(tagName)
        console.log("taggedPosts:", taggedPosts)
        res.send({posts: taggedPosts})

    }catch({name, message}){
        next({ name, message })
    }
})
module.exports = tagsRouter
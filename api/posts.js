const express = require("express")
const postsRouter = express.Router()
const {requireUser} = require('./utils')
const {getAllPosts, createPost, updatePost, getPostById} = require('../db')
// use Router to create a new router and export it 
postsRouter.use((req, res, next) => {
    console.log("request being made to /posts");
    next()
})


postsRouter.post('/', requireUser, async (req, res, next) => {
    const { title, content, tags = "" } = req.body;
    // removes any spaces in front of or behind and then turns the string into an array, 
    // splitting over any number of spaces
    const tagArr = tags.trim().split(/\s+/)
    const postData = {authorId, title, content};
  
    // only send the tags if there are some to send
    if (tagArr.length) {
      postData.tags = tagArr;
    }
  
    try {
      const post = await createPost(postData);
      res.send({ post });
      // otherwise, next an appropriate error object 
    } catch ({ name, message }) {
      next({name, message});
    }
  });

postsRouter.patch('/:postId', requireUser, async (req, res, next) => {
    const { postId } = req.params;
    const { title, content, tags } = req.body;
  
    const updateFields = {};
  
    if (tags && tags.length > 0) {
      updateFields.tags = tags.trim().split(/\s+/);
    }
  
    if (title) {
      updateFields.title = title;
    }
  
    if (content) {
      updateFields.content = content;
    }
  
    try {
      const originalPost = await getPostById(postId);
  
      if (originalPost.author.id === req.user.id) {
        const updatedPost = await updatePost(postId, updateFields);
        res.send({ post: updatedPost })
      } else {
        next({
          name: 'UnauthorizedUserError',
          message: 'You cannot update a post that is not yours'
        })
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  });

// fires whenever a GET request is made to /api/posts
// returns an object with an empty array 
postsRouter.get('/', async (req, res) => {
    const posts = await getAllPosts()
    res.send({
        posts
    });
});
module.exports = postsRouter
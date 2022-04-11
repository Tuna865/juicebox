const express = require("express")
const postsRouter = express.Router()
const {requireUser} = require('./utils')
const {getAllPosts, createPost, updatePost, getPostById} = require('../db')
// use Router to create a new router and export it 
postsRouter.use((req, res, next) => {
    console.log("request being made to /posts");
    next()
})
// CREATE POST
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
// UPDATE POST
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
//   DELETE POST 
postsRouter.delete('/:postId', requireUser, async (req, res, next) => {
    try {
      const post = await getPostById(req.params.postId);
  
      if (post && post.author.id === req.user.id) {
        const updatedPost = await updatePost(post.id, { active: false });
        console.log("post deleted")
        res.send({ post: updatedPost });
      } else {
        // if there was a post, throw UnauthorizedUserError, otherwise throw PostNotFoundError
        next(post ? { 
          name: "UnauthorizedUserError",
          message: "You cannot delete a post which is not yours"
        } : {
          name: "PostNotFoundError",
          message: "That post does not exist"
        });
      }
  
    } catch ({ name, message }) {
      next({ name, message })
    }
  });

// fires whenever a GET request is made to /api/posts
// returns an object with an empty array 
postsRouter.get('/', async (req, res, next) => {
    try {
      const allPosts = await getAllPosts();
  
      // keep a post if it is either active, or if it belongs to the current user
      const posts = allPosts.filter(post => {
        // in order: if the post is active, doesn't matter who it belongs to;
        // if the post is not active, but it belogs to the current user;          
        // if none of the above are true;
        return post.active || (req.user && post.author.id === req.user.id);

      });
  
      res.send({
        posts
      });
    } catch ({ name, message }) {
      next({ name, message });
    }
  });
  
module.exports = postsRouter
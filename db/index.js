/* this file provides utility for the rest of the application will use;
they can be called from seed.js but also from the main application file    */

const { Client } = require('pg');
// give the name & location of the database, added some Heroku stuff later 
const client = new Client(process.env.DATABASE_URL || 'postgres://localhost:5432/juicebox-dev');

async function getAllUsers() {
    // remember semicolons for SQL commands or it gets mad
   const {rows} = await client.query(
       `SELECT id, username, name, location, active
        FROM users;`
    );
    return rows;
}
async function getAllPosts() {
   const {rows: postIds} = await client.query(
       `SELECT id
        FROM posts;`
    );

    const posts = await Promise.all(postIds.map(
        post => getPostById(post.id)
    ))
    return posts;
}

async function getAllTags() {
  const {rows} = await client.query(
    `SELECT name 
     FROM tags;`
  );
  return rows;
}

async function createUser({ username, password, name, location }) {
    try {
        // $1-$4 correspond to username etc (order matters)
      const {rows: [user]} = await client.query(`
        INSERT INTO users(username, password, name, location)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (username) DO NOTHING
        RETURNING *;
      `, [username, password, name, location]);
  
      return user;
    } catch (error) {
      throw error;
    }
  }

async function createPost({ authorId, title, content, tags = [] }){
    try {
        const {rows: [post]} = await client.query(`
        INSERT INTO posts("authorId", title, content)
        VALUES ($1, $2, $3)
        RETURNING *;
        `, [authorId, title, content]);
        
        const tagList = await createTags(tags);

        return await addTagsToPost(post.id, tagList);
    } catch (error){
        throw error;
    }
}

async function updateUser(id, fields = {}) {
    // build the set string
    const setString = Object.keys(fields).map(
      (key, index) => `"${ key }"=$${ index + 1 }`
    ).join(', ');
  
    // return early if this is called without fields
    if (setString.length === 0) {
      return;
    }
    try {
      const {rows: [user]} = await client.query(`
        UPDATE users
        SET ${setString}
        WHERE id=${id}
        RETURNING *;
      `, Object.values(fields));
  
      return user;
    } catch (error) {
      throw error;
    }
  }
async function updatePost(postId, fields = {}) {
    // read off the tags & remove that field 
    const { tags } = fields; // might be undefined
    delete fields.tags;
  
    // build the set string
    const setString = Object.keys(fields).map(
      (key, index) => `"${ key }"=$${ index + 1 }`
    ).join(', ');
  
    try {
      // update any fields that need to be updated
      if (setString.length > 0) {
        await client.query(`
          UPDATE posts
          SET ${ setString }
          WHERE id=${ postId }
          RETURNING *;
        `, Object.values(fields));
      }
  
      // return early if there's no tags to update
      if (tags === undefined) {
        return await getPostById(postId);
      }
  
      // make any new tags that need to be made
      const tagList = await createTags(tags);
      const tagListIdString = tagList.map(
        tag => `${ tag.id }`
      ).join(', ');
  
      // delete any post_tags from the database which aren't in that tagList
      await client.query(`
        DELETE FROM post_tags
        WHERE "tagId"
        NOT IN (${ tagListIdString })
        AND "postId"=$1;
      `, [postId]);
  
      // and create post_tags as necessary
      await addTagsToPost(postId, tagList);
  
      return await getPostById(postId);
    } catch (error) {
      throw error;
    }
  }

  // these next two functions enable us to get the user's posts along with their other info 
async function getPostsByUser(userId) {
    try {
      const { rows: postIds } = client.query(`
      SELECT id 
      FROM posts
      WHERE "authorId"=${ userId };
      `);
      if(!postIds){ return []}
      console.log("getPostsByUser running", postIds)
      const posts = await Promise.all(postIds.map(
          post => getPostById(post.id)
      ));
      console.log("getPostsByUser still running...")
      return posts;
    } catch (error) {
      throw error;
    }
  }
async function getUserById(userId){
      try{
          const {rows: [user]} = await client.query(`
          SELECT id, username, name, location, active
          FROM users
          WHERE id=${userId}
          `)
        // if there is no user return null
        if(!user){
            return null;
        }

        user.posts = await getPostsByUser(userId)

        return user;
      }catch(error){
          throw error;
      }
  }
async function getUserByUsername(username) {
  try {
    const { rows: [user] } = await client.query(`
      SELECT *
      FROM users
      WHERE username=$1;
    `, [username]);

    return user;
  } catch (error) {
    throw error;
  }
}
async function getPostById(postId) {
    try {
      const { rows: [ post ]  } = await client.query(`
        SELECT *
        FROM posts
        WHERE id=$1;
      `, [postId]);
      // if there is no post the error gets thrown early, 
      // tags & author info dont get attached
      if (!post) {
        throw {
          name: "PostNotFoundError",
          message: "Could not find a post with that postId"
        };
      }
      const { rows: tags } = await client.query(`
        SELECT tags.*
        FROM tags
        JOIN post_tags ON tags.id=post_tags."tagId"
        WHERE post_tags."postId"=$1;
      `, [postId])
  
      const { rows: [author] } = await client.query(`
        SELECT id, username, name, location
        FROM users
        WHERE id=$1;
      `, [post.authorId])
  
      post.tags = tags;
      post.author = author;
  
      delete post.authorId;
  
      return post;
    } catch (error) {
      throw error;
    }
  }
async function getPostsByTagName(tagName) {
    try {
      const { rows: postIds } = await client.query(`
        SELECT posts.id
        FROM posts
        JOIN post_tags ON posts.id=post_tags."postId"
        JOIN tags ON tags.id=post_tags."tagId"
        WHERE tags.name=$1;
      `, [tagName]);
  
      return await Promise.all(postIds.map(
        post => getPostById(post.id)
      ));
    } catch (error) {
      throw error;
    }
  } 
async function createTags(tagList){
    // end early if the tag list is nothing
    if(tagList.length === 0){return;}
    // dont know that the instructions mean by the underscore before index 
    // this will allow us to insert values to be created as tags
    const insertValues = tagList.map(
        (_, index) => `$${index +1}`).join('),(');
    // this will allow us to select the newly created tags 
    const selectValues = tagList.map(
        (_, index) => `$${index + 1}`).join(', ');
    
    try{
        await client.query(
            `INSERT INTO tags(name)
            VALUES (${insertValues})
            ON CONFLICT (name) DO NOTHING;
            `
            ,tagList
          )
          console.log("...still creating tags...")
          const {rows} = await client.query(
            `SELECT * FROM tags
            WHERE name
            IN (${selectValues});
      
            `, tagList
          )

        return rows
    }catch(error){
        throw error
    }
}
async function createPostTag(postId, tagId) {
    try {
      await client.query(`
        INSERT INTO post_tags("postId", "tagId")
        VALUES ($1, $2)
        ON CONFLICT ("postId", "tagId") DO NOTHING;
      `, [postId, tagId]);
    } catch (error) {
      throw error;
    }
  }

async function addTagsToPost(postId, tagList) {
    try {
        const createPostTagPromises = tagList.map(
        tag => createPostTag(postId, tag.id)
        );

        await Promise.all(createPostTagPromises);

        return await getPostById(postId);
    } catch (error) {
        throw error;
    }
}

module.exports = {
    client,
    getAllUsers,
    getAllPosts,
    getAllTags,
    getPostsByUser,
    getPostById,
    getPostsByTagName,
    getUserById,
    getUserByUsername,
    addTagsToPost,
    createUser,
    createPost,
    createTags,
    createPostTag,
    updateUser, 
    updatePost,
}












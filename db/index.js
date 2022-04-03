/* this file provides utility for the rest of the application will use;
they can be called from seed.js but also from the main application file    */


const { Client } = require('pg');
// give the name & location of the database
const client = new Client('postgres://localhost:5432/juicebox-dev');

async function getAllUsers() {
    // remember semicolons for SQL commands or it gets mad
   const {rows} = await client.query(
       `SELECT id, username, name, location, active
        FROM users;`
    );
    return rows;
}
async function getAllPosts() {
    // remember semicolons for SQL commands or it gets mad
   const {rows} = await client.query(
       `SELECT *
        FROM posts;`
    );
    return rows;
}

async function createUser({ username, password, name, location }) {
    try {
        // $1-$4 correspond to username et al (order matters)
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

async function createPost({ authorId, title, content }){
    try {
        const {rows: [post]} = await client.query(`
        INSERT INTO posts("authorId", title, content)
        VALUES ($1, $2, $3)
        RETURNING *;
        `, [authorId, title, content])
        return post;
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
async function updatePost(id, fields = {}) {
    // build the set string, same as above
    const setString = Object.keys(fields).map(
      (key, index) => `"${ key }"=$${ index + 1 }`
    ).join(', ');
    // end if there's no fields
    if (setString.length === 0) {
      return;
    }
    try {
      const {rows: [post]} = await client.query(`
        UPDATE posts
        SET ${setString}
        WHERE id=${id}
        RETURNING *;
      `, Object.values(fields));
  
      return post;
    } catch (error) {
      throw error;
    }
  }

  // these next two functions enable us to get the user's posts along with their other info 
  async function getPostsByUser(userId) {
    try {
      const { rows } = client.query(`
        SELECT * FROM posts
        WHERE "authorId"=${ userId };
      `);
  
      return rows;
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

module.exports = {
    client,
    getAllUsers,
    getAllPosts,
    getPostsByUser,
    getUserById,
    createUser,
    createPost,
    updateUser, 
    updatePost,
}












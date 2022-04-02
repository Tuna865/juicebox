/* this file provides utility for the rest of the application will use;
they can be called from seed.js but also from the main application file    */


const { Client } = require('pg');
// give the name & location of the database
const client = new Client('postgres://localhost:5432/juicebox-dev');

async function getAllUsers() {
    // remember semicolons for SQL commands or it gets mad
   const {rows} = await client.query(
       `SELECT id, username
        FROM users;`
    );
    return rows;
}

async function createUser({ username, password }) {
    try {
        // $1 and $2 correspond to username and password, respectively (order matters)
      const {rows} = await client.query(`
        INSERT INTO users(username, password)
        VALUES ($1, $2)
        ON CONFLICT (username) DO NOTHING
        RETURNING *;
      `, [username, password]);
  
      return rows;
    } catch (error) {
      throw error;
    }
  }


module.exports = {
    client,
    getAllUsers,
    createUser,
}












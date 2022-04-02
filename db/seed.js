const {
    client, 
    getAllUsers,
    createUser
} = require('./index')

async function createInitialUsers(){
    try{
        console.log("creating users...")

        const albert = await createUser({username: 'albert', password: 'bertie99'});
        const sandra = await createUser({ username: 'sanrda', password: '2sandy4me' });
        const glamgal = await createUser({ username: 'glamgal', password: 'soglam' });

        console.log(albert, sandra, glamgal);

        console.log("users created")
    }catch(error) {
        console.error("error creating users");
        throw error;
      }
}

// this function will drop all the tables from the db
async function dropTables() {
    try {
        console.log("dropping tables...")
        await client.query(`
        DROP TABLE IF EXISTS users;
        `);
        console.log("tables = dropped")
    } catch (error){
    // pass error to the function that calls dropTables
    console.error("error dropping tables")
    throw error;
    }
}

// creates all the tables for the db
async function createTables() {
    try {
        console.log("creating tables...")
        await client.query(`
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            username varchar(255) UNIQUE NOT NULL,
            password varchar(255) NOT NULL
        );
        `);
        console.log("tables created")
    } catch (error){
    // pass error to the function that calls createTables
    console.error("error creating tables")
    throw error;
    }
}



async function rebuildDB() {
    try{
        client.connect();

        await dropTables();
        await createTables();
        await createInitialUsers();
    }catch(error) {
        throw error    
    }
}

// connect client to database
async function testDB() {
    try{
        console.log("testing database")

        const users = await getAllUsers();
        console.log("getAllUsers", users)

        console.log("database tested")
    } catch(error) {
        console.error("error testing database")
        throw error;
    } 
}

rebuildDB()
    .then(testDB)
    .catch(console.error)
    .finally(() => client.end);







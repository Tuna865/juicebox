const {
    client,
    getAllUsers,
    getAllPosts,
    getPostsByUser,
    getUserById,
    createUser,
    createPost,
    updateUser, 
    updatePost,
} = require('./index')

async function createInitialUsers(){
    try{
        console.log("creating users...")

        const albert = await createUser({
            username: 'albert', 
            password: 'bertie99',
            name: 'Albert',
            location: 'Edinburgh'
        });
        // console.log(albert);
        const sandra = await createUser({ 
            username: 'sanrda', 
            password: '2sandy4me',
            name: 'Alessandra',
            location: 'Milan' 
        });
        // console.log(sandra);
        const glamgal = await createUser({ 
            username: 'glamgal', 
            password: 'soglam',
            name: 'Lindsey',
            location: 'Los Angeles' 
        });
        // console.log(glamgal);


        console.log("users created")
    }catch(error) {
        console.error("error creating users");
        throw error;
      }
}

async function createInitialPosts() {
    try{
        const[
            albert, 
            sandra, 
            glamgal] = await getAllUsers();
        console.log("creating posts...")
        await createPost({
            authorId: albert.id,
            title: "Gordon's first post",
            content: "This shall be my first post about why the US needs trains."
        })
        await createPost({
            authorId: sandra.id,
            title: "Alessandra's first post",
            content: "Check out this new Gucci merch drop coming up!"
        })
        await createPost({
            authorId: glamgal.id,
            title: "Lindsey's first post",
            content: "Heyyyyy click the link in my bio for 1% off"
        })
        console.log("...posts created")

    }catch(error){
        throw error;
    }
}

// this function will drop all the tables from the db
async function dropTables() {
    try {
        console.log("dropping tables...")
        await client.query(`
        DROP TABLE IF EXISTS posts;
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
            name VARCHAR(255) NOT NULL,
            location VARCHAR(255) NOT NULL,
            active BOOLEAN DEFAULT true,
            id SERIAL PRIMARY KEY,
            username varchar(255) UNIQUE NOT NULL,
            password varchar(255) NOT NULL
        );
        CREATE TABLE posts (
            id SERIAL PRIMARY KEY,
            "authorId" INTEGER REFERENCES users(id),
            title varchar(255) NOT NULL,
            content TEXT NOT NULL,
            active BOOLEAN DEFAULT true
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
        await createInitialPosts();
    }catch(error) {
        throw error    
    }
}

// connect client to database
async function testDB() {
    try{
        console.log("testing database...")


        const users = await getAllUsers();
        console.log("getAllUsers", users)

        console.log("calling updateUser on users[0] (first user)")
        const updateUserResult = await updateUser(users[0].id, {
            name: "Gordon",
            location: "Sodor"
        });
        console.log("update result:", updateUserResult)

        console.log("calling getAllPosts function")
        const posts = await getAllPosts()
        console.log("getAllPosts results:", posts)
        
        console.log("calling updatePost on posts[0] (first post)")
        const updatePostResult = await updatePost(posts[0].id, {
            title: "First Post (edited)",
            content: "This shall be my first post about why the US needs more trains and less interstates."
        })
        console.log("updatePost result:", updatePostResult)

        console.log("calling getUserById function with 1")
        const albert = await getUserById(1);
        console.log("getUserById results:", albert)


        console.log("...database tested")
    } catch(error) {
        console.error("error testing database")
        throw error;
    } 
}

rebuildDB()
    .then(testDB)
    .catch(console.error)
    .finally(() => client.end);







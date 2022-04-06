const {
    client,
    getAllUsers,
    getAllPosts,
    getPostsByUser,
    getPostById,
    getUserById,
    getPostsByTagName,
    addTagsToPost,
    createUser,
    createPost,
    createTags,
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


        console.log("...users created")
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
            content: "This shall be my first post about why the US needs trains.",
            tags: ["#happy", "#youcandoanything"]
        })
        await createPost({
            authorId: sandra.id,
            title: "Alessandra's first post",
            content: "Check out this new Gucci merch drop coming up!",
            tags: ["#happy", "#worst-day-ever"]
        })
        await createPost({
            authorId: glamgal.id,
            title: "Lindsey's first post",
            content: "Heyyyyy click the link in my bio for 1% off",
            tags: ["#happy", "#youcandoanything", "#canmandoeverything"]
        })
        console.log("...posts created")

    }catch(error){
        throw error;
    }
}

async function createInitialTags() {
    try {
      console.log("creating tags...");
  
      const [happy, sad, inspo, catman] = await createTags([
        '#happy', 
        '#worst-day-ever', 
        '#youcandoanything',
        '#catmandoeverything'
      ]);
        console.log("...adding tags to posts...")
      const [postOne, postTwo, postThree] = await getAllPosts();
  
      await addTagsToPost(postOne.id, [happy, inspo]);
      await addTagsToPost(postTwo.id, [sad, inspo]);
      await addTagsToPost(postThree.id, [happy, catman, inspo]);
  
      console.log("...tags created");
    } catch (error) {
      console.log("error creating tags");
      throw error;
    }
  }

// this function will drop all the tables from the db
async function dropTables() {
    try {

        console.log("dropping tables...")
        // these have to be in the correct order
        await client.query(`
        DROP TABLE IF EXISTS post_tags;
        DROP TABLE IF EXISTS tags;
        DROP TABLE IF EXISTS posts;
        DROP TABLE IF EXISTS users;
        `);
        console.log("...tables = dropped")

    } catch (error){
    // pass error to the function that calls dropTables, will do this to most other functions too
    console.error("error dropping tables")
    throw error;
    }
}

// creates all the tables for the db
async function createTables() {
    try {
        console.log("creating tables...")
        // order matters with these tables!!!!
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
        CREATE TABLE tags (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) UNIQUE NOT NULL
        );
        CREATE TABLE post_tags (
            "postId" INTEGER REFERENCES posts(id),
            "tagId" INTEGER REFERENCES tags(id),
            UNIQUE("postId", "tagId")
        );
        `);
        console.log("...tables created")
    } catch (error){
    // pass error to the function that calls createTables
    console.error("error creating tables")
    throw error;
    }
}

async function rebuildDB() {
    try{
        client.connect();
        console.log("rebuilding database...")
        await dropTables();
        await createTables();
        await createInitialUsers();
        await createInitialPosts();
        console.log("...database rebuilt")
    }catch(error) {
        console.log("error rebuilding the database")
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
            title: "Gordon's first post (edited)",
            content: "This shall be my first post about why the US needs more trains and less interstates."
        })
        console.log("updatePost result:", updatePostResult)

        console.log("Calling updatePost on posts[1], only updating tags");
        const updatePostTagsResult = await updatePost(posts[1].id, {
        tags: ["#youcandoanything", "#redfish", "#bluefish"]
        });
        console.log("updatePost with tags result:", updatePostTagsResult);

        console.log("Calling getPostsByTagName with #happy");
        const postsWithHappy = await getPostsByTagName("#happy");
        console.log("getPostsByTagName result:", postsWithHappy);

        // console.log("calling getUserById function with 1")
        // const albert = await getUserById(1);
        // console.log("getUserById results:", albert)


        console.log("...database tested")
    } catch(error) {
        console.error("error testing database")
        throw error;
    } 
}

rebuildDB()
    .then(testDB)
    .catch(console.error)
    .finally(() => client.end());

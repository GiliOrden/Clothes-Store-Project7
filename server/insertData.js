var mysql = require("mysql2");
var config = require("./dbconfig");
const http = require("http");

var con = mysql.createConnection(config);

// execute SQL query
function executeQuery(query) {
  return new Promise((resolve, reject) => {
    con.query(query, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

// insert user
async function insertUsers(user) {
  const { username, password, is_admin } = user;

  const query = `INSERT INTO users (username, password, is_admin) VALUES (${username}, '${password}', '${is_admin}')`;
  await executeQuery(query);
}

//insert post
async function insertItems(post) {
  const { userId, title, body } = post;

  const query = `INSERT INTO posts (userId, title, body) VALUES (${userId}, '${title}', '${body}')`;
  await executeQuery(query);
}

// insert todos
async function insertTodo(todo) {
  const { userId, title, completed } = todo;

  const query = `INSERT INTO todos (userId, title, completed) VALUES (${userId}, '${title}', ${completed})`;
  await executeQuery(query);
}

// insert user
async function insertUser(user) {
  const { name, username, email, address, phone, website } = user;
  const { street, suite, city } = address;

  const query = `INSERT INTO users (name, username, email, street, suite, city, phone, website) VALUES ('${name}', '${username}', '${email}', '${street}', '${suite}', '${city}', '${phone}', '${website}')`;
  await executeQuery(query);
}

// generate password
function generatePassword() {
  const length = 8;
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset.charAt(randomIndex);
  }

  return password;
}

// insert object to users_passwords table
async function insertUserPassword(userId, password) {
  const query = `INSERT INTO users_passwords (userId, password) VALUES (${userId}, '${password}')`;
  await executeQuery(query);
}

// insert album
async function insertAlbum(album) {
  const { userId, id, title } = album;

  const query = `INSERT INTO albums (userId, id, title) VALUES (${userId}, ${id}, '${title}')`;
  await executeQuery(query);
}

// insert photo
async function insertPhoto(photo) {
  const { albumId, id, title, url, thumbnailUrl } = photo;

  const query = `INSERT INTO photos (albumId, id, title, url, thumbnailUrl) VALUES (${albumId}, ${id}, '${title}', '${url}', '${thumbnailUrl}')`;
  await executeQuery(query);
}

// get data from the URL
function fetchData(url) {
  return new Promise((resolve, reject) => {
    http
      .get(url, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          resolve(JSON.parse(data));
        });
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

async function createTables() {
  try {
    // Create comments table
    await executeQuery(
      "CREATE TABLE IF NOT EXISTS comments (id INT AUTO_INCREMENT PRIMARY KEY, postId INT, name VARCHAR(255), email VARCHAR(255), body TEXT)"
    );

    // Create posts table
    await executeQuery(
      "CREATE TABLE IF NOT EXISTS posts (id INT AUTO_INCREMENT PRIMARY KEY, userId INT, title VARCHAR(255), body TEXT)"
    );

    // Create todos tabke
    await executeQuery(
      "CREATE TABLE IF NOT EXISTS todos (id INT AUTO_INCREMENT PRIMARY KEY, userId INT, title VARCHAR(255), completed BOOLEAN)"
    );

    // Create users table
    await executeQuery(
      "CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), username VARCHAR(255) UNIQUE, email VARCHAR(255), street VARCHAR(255), suite VARCHAR(255), city VARCHAR(255), phone VARCHAR(255), website VARCHAR(255))"
    );

    // Create users_passwords table
    await executeQuery(
      "CREATE TABLE IF NOT EXISTS users_passwords (userId INT PRIMARY KEY, password VARCHAR(255))"
    );

    // Create albums table
    await executeQuery(
      "CREATE TABLE IF NOT EXISTS albums (id INT AUTO_INCREMENT PRIMARY KEY, userId INT, title VARCHAR(255))"
    );

    // Create photos table
    await executeQuery(
      "CREATE TABLE IF NOT EXISTS photos (id INT AUTO_INCREMENT PRIMARY KEY, albumId INT, title VARCHAR(255), url VARCHAR(255), thumbnailUrl VARCHAR(255))"
    );

    // Récupération des données et insertion dans la table "comments"
    const comments = await fetchData(
      "http://jsonplaceholder.typicode.com/comments"
    );
    for (const comment of comments) {
      await insertComment(comment);
    }

    // get data from the URL et put in posts table
    const posts = await fetchData("http://jsonplaceholder.typicode.com/posts");
    for (const post of posts) {
      await insertPost(post);
    }

    // get data from the URL et put in todos table
    const todos = await fetchData("http://jsonplaceholder.typicode.com/todos");
    for (const todo of todos) {
      await insertTodo(todo);
    }

    // get data from the URL et put in users table
    const users = await fetchData("http://jsonplaceholder.typicode.com/users");
    for (const user of users) {
      await insertUser(user);
      const password = generatePassword();
      await insertUserPassword(user.id, password);
    }

    // get data from the URL et put in albums table
    const albums = await fetchData(
      "http://jsonplaceholder.typicode.com/albums"
    );
    for (const album of albums) {
      await insertAlbum(album);
    }

    // get data from the URL et put in photos table
    const photos = await fetchData(
      "http://jsonplaceholder.typicode.com/photos"
    );
    for (const photo of photos) {
      await insertPhoto(photo);
    }

    // end connection
    con.end();
    console.log(
      'Tables "comments", "posts", "todos", "users", "users_passwords" , "albums", and "photos" created.'
    );
  } catch (error) {
    console.error("Error:", error);
  }
}

// Create tables and insert data
createTables();

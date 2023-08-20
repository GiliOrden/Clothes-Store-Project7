//94124
const mysql = require("mysql2");
const http = require("http");
const db = require("./dbconfig");

//make a connection with the database
var connection = mysql.createConnection(db);

// Connect to the MySQL server
connection.connect((err) => {
  if (err) {
    console.error("Failed to connect to the MySQL server:", err);
    return;
  }
  console.log("Connected to the MySQL server");

  // Create the database if it doesn't exist
  connection.query("CREATE DATABASE IF NOT EXISTS fullStackProject7", (err) => {
    if (err) {
      console.error("Failed to create database:", err);
      return;
    }

    // Switch to the newly created database
    connection.query("USE fullStackProject7", (err) => {
      if (err) {
        console.error("Failed to switch to the database:", err);
        return;
      }
      console.log("Using the database: fullStackProject7");

      // Create the users table
      const createUsersTable = `CREATE TABLE IF NOT EXISTS users (
        username VARCHAR(100) PRIMARY KEY,
        password VARCHAR(100) NOT NULL,
        is_admin BOOLEAN NOT NULL
      )`;

      connection.query(createUsersTable, (err) => {
        if (err) {
          console.error("Failed to create users table:", err);
          return;
        }
        console.log("Users table created successfully");
      });

      // Create the items table
      const createItemsTable = `CREATE TABLE IF NOT EXISTS items (
        item_id INT AUTO_INCREMENT PRIMARY KEY,
        item_description VARCHAR(255) NOT NULL,
        type ENUM('Shirt', 'Skirt', 'Dress' ,'Shoes', 'accessories' ) DEFAULT 'accessories',
        date_add DATE NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        image VARCHAR(255) NOT NULL
      )`;
      connection.query(createItemsTable, (err) => {
        if (err) {
          console.error("Failed to create items table:", err);
          return;
        }
        console.log("Items table created successfully");
      });

      // Create the liked table
      const createLikedTable = `CREATE TABLE IF NOT EXISTS liked (
        item_id INT,
        username VARCHAR(100) ,
        PRIMARY KEY (item_id, username),
        FOREIGN KEY (item_id) REFERENCES items(item_id), 
        FOREIGN KEY (username) REFERENCES users(username)
        
      )`;
      connection.query(createLikedTable, (err) => {
        if (err) {
          console.error("Failed to create liked table:", err);
          return;
        }
        console.log("Liked table created successfully");
      });

      // Create the amount table
      const createAmountTable = `CREATE TABLE IF NOT EXISTS amount (
        item_id INT,
        size ENUM('XS', 'S', 'M', 'L', 'XL'),
        amount INT DEFAULT 5,
        PRIMARY KEY (item_id, size),
        FOREIGN KEY (item_id) REFERENCES items(item_id)
      )`;
      connection.query(createAmountTable, (err) => {
        if (err) {
          console.error("Failed to create amount table:", err);
          return;
        }
        console.log("Amount table created successfully");
      });

      // Create the cart table
      const createCartsTable = `CREATE TABLE IF NOT EXISTS cart (
        item_id INT,
        username VARCHAR(100),
        size ENUM('XS', 'S', 'M', 'L', 'XL'), 
        PRIMARY KEY (item_id, username, size),
        FOREIGN KEY (item_id) REFERENCES items(item_id),
        FOREIGN KEY (username) REFERENCES users(username),
        FOREIGN KEY (item_id, size) REFERENCES amount(item_id, size) 
      )`;
      connection.query(createCartsTable, (err) => {
        if (err) {
          console.error("Failed to create cart table:", err);
          return;
        }
        console.log("Cart table created successfully");
      });

      // Close the MySQL connection
      connection.end((err) => {
        if (err) {
          console.error("Failed to close the connection:", err);
        }
      });
    });
  });
});

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
var config = require("./dbconfig");

const app = express();
app.use(express.json());
app.use(cors());

const con = mysql.createConnection(config);

con.connect((err) => {
  if (err) {
    console.error("Error in connection to database", err);
    return;
  }
  console.log("Connected to the database");
});

app.get("/", (req, res) => {
  res.send("Connected to the data base and server");
});
//####################     users        ##############################
/// USERS ///
// login user:
// example: http://localhost:3001/users?username=john_doe&password=mysecretpassword
app.get("/users", (req, res) => {
  let username = req.query.username;
  let password = req.query.password;

  const query = `SELECT username, is_admin FROM users WHERE username = '${username}' AND password = '${password}'`;

  con.query(query, (err, results) => {
    if (err) {
      console.error("Error in request execution", err);
      return res
        .status(500)
        .send({ error: "An error occurred while retrieving user details." });
    }
    if (results.length === 0) {
      return res.status(404).send({ error: "user not found" });
    }
    res.status(200).send(results);
  });
});
// {
//     "username": "John",
//     "password": "Doe",
//     "is_admin": false
//  }
// create user:
app.post("/users", (req, res) => {
  let newUser = req.body;

  if (
    !newUser.username ||
    !newUser.password ||
    newUser.is_admin === undefined
  ) {
    return res.status(400).send({ error: "Invalid user data" });
  }

  // Convert the is_admin value to an integer (0 for false, 1 for true)
  const is_admin = newUser.is_admin ? 1 : 0;

  // Check if the username already exists in the database
  const usernameExistsQuery =
    "SELECT COUNT(*) AS count FROM users WHERE username = ?";
  con.query(usernameExistsQuery, newUser.username, (err, result) => {
    if (err) {
      console.error("Error in request execution", err);
      return res
        .status(500)
        .send({ error: "An error occurred while checking username" });
    }

    if (result[0].count > 0) {
      return res.status(409).send({
        error: "The username already exists. Please choose another username.",
      });
    }

    // Username is unique, proceed with user creation
    const insertQuery =
      "INSERT INTO users (username, password, is_admin) VALUES (?, ?, ?)";
    const values = [newUser.username, newUser.password, is_admin];

    con.query(insertQuery, values, (err, results) => {
      if (err) {
        console.error("Error in request execution", err);
        return res
          .status(500)
          .send({ error: "An error occurred while creating user details." });
      }

      // User successfully created, fetch the user data from the database
      const selectQuery =
        "SELECT username, is_admin FROM users WHERE username = ?";
      con.query(selectQuery, newUser.username, (err, result) => {
        if (err) {
          console.error("Error in request execution", err);
          return res
            .status(500)
            .send({ error: "An error occurred while fetching user details." });
        }

        if (result.length === 0) {
          return res.status(404).send({ error: "User not found" });
        }

        res.status(200).send(result);
      });
    });
  });
});

// update password of users:
// example: http://localhost:3001/users
// {
//     "username": "John",
//     "oldPassword": "Doe",
//     "newPassword": "newsecretpassword"
//   }
app.put("/users", (req, res) => {
  const { username, oldPassword, newPassword } = req.body;

  if (!username || !oldPassword || !newPassword) {
    return res
      .status(400)
      .send({ error: "Invalid request. Missing required fields." });
  }

  // Step 1: Check if the old password is correct in the database
  const selectQuery = "SELECT password FROM users WHERE username = ?";
  con.query(selectQuery, username, (err, result) => {
    if (err) {
      console.error("Error in request execution", err);
      return res
        .status(500)
        .send({ error: "An error occurred while checking the old password." });
    }

    if (result.length === 0) {
      return res
        .status(404)
        .send({ error: "User not found. Incorrect username." });
    }

    const storedPassword = result[0].password;

    // Compare the stored password with the old password provided in the request
    if (storedPassword !== oldPassword) {
      return res
        .status(401)
        .send({ error: "Incorrect old password. Password not updated." });
    }

    // Step 2: Update the user's password to the new one
    const updateQuery = "UPDATE users SET password = ? WHERE username = ?";
    con.query(updateQuery, [newPassword, username], (err, updateResult) => {
      if (err) {
        console.error("Error in request execution", err);
        return res
          .status(500)
          .send({ error: "An error occurred while updating the password." });
      }

      // Step 3: Send a response with a success status
      return res.status(200).send({ status: "Password updated successfully." });
    });
  });
});
//####################     items        ##############################

app.get("/items", (req, res) => {
  const itemType = req.query.type;

  if (!itemType) {
    // If no 'type' parameter is provided, return all items
    const query = "SELECT * FROM items";
    con.query(query, (err, results) => {
      if (err) {
        console.error("Error in request execution", err);
        return res
          .status(500)
          .send({ error: "An error occurred while fetching items." });
      }

      // If there are no items in the database, return an empty array
      if (results.length === 0) {
        return res.status(200).send([]);
      }

      // If items are found, send the items array in the response
      res.status(200).send(results);
    });
  } else {
    // If 'type' parameter is provided, filter items by the specified type
    const query = "SELECT * FROM items WHERE type = ?";
    con.query(query, [itemType], (err, results) => {
      if (err) {
        console.error("Error in request execution", err);
        return res
          .status(500)
          .send({ error: "An error occurred while fetching items by type." });
      }

      // If there are no items of the specified type in the database, return an empty array
      if (results.length === 0) {
        return res.status(200).send([]);
      }

      // If items of the specified type are found, send the items array in the response
      res.status(200).send(results);
    });
  }
});

// example: http://localhost:3001/items
//get all the items in the db
app.get("/items", (req, res) => {
  const query = "SELECT * FROM items";

  con.query(query, (err, results) => {
    if (err) {
      console.error("Error in request execution", err);
      return res
        .status(500)
        .send({ error: "An error occurred while fetching items." });
    }

    // If there are no items in the database, return an empty array
    if (results.length === 0) {
      return res.status(200).send([]);
    }

    // If items are found, send the items array in the response
    res.status(200).send(results);
  });
});

app.listen(3001, () => {
  console.log("app listening on port 3001.");
  console.log("http://localhost:3001/");
});

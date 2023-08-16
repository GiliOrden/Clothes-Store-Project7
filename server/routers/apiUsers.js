const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");
var config = require("../dbconfig");
// GET /api/users
// login user:
// example: http://localhost:3001/api/users?username=user1&password=user1pass
router.get("/", (req, res) => {
  let username = req.query.username;
  let password = req.query.password;
  getUserDetails(username, password)
    .then((results) => {
      if (results.length === 0) {
        return res.status(404).send({ error: "User not found" });
      }
      res.status(200).send(results);
    })
    .catch((err) => {
      console.error("Error in request execution", err);
      res
        .status(500)
        .send({ error: "An error occurred while retrieving user details." });
    });
});

async function getUserDetails(username, password) {
  const pool = mysql.createPool(config); // Use createPool for promise interface
  const query = `SELECT username, is_admin FROM users WHERE username = ? AND password = ?`;
  const values = [username, password];

  try {
    const [results] = await pool.query(query, values); // Use pool.promise().query()
    return results;
  } catch (error) {
    throw error;
  }
}

// POST /api/users
// {
//     "username": "John",
//     "password": "Doe",
//     "is_admin": false
//  }
// create user:
router.post("/", (req, res) => {
  let newUser = req.body;

  if (
    !newUser.username ||
    !newUser.password ||
    newUser.is_admin === undefined
  ) {
    return res.status(400).send({ error: "Invalid user data" });
  }

  const is_admin = newUser.is_admin ? 1 : 0;

  const usernameExists = checkUsernameExists(newUser.username);

  if (!usernameExists) {
    return res.status(409).send({
      error: "The username already exists. Please choose another username.",
    });
  }

  createUser(newUser.username, newUser.password, is_admin)
    .then((results) => {
      res.status(200).send("The user added successfully!");
    })
    .catch((err) => {
      console.error("Error processing user data", err);
      res
        .status(500)
        .send({ error: "An error occurred while processing user data." });
    });
});

async function checkUsernameExists(username) {
  const pool = mysql.createPool(config);
  const query = `SELECT COUNT(*) AS count FROM users WHERE username = ?`;
  try {
    const [result] = await pool.query(query, [username]);

    return result[0].count > 0;
  } catch (error) {
    throw error;
  }
}

async function createUser(username, password, is_admin) {
  const pool = mysql.createPool(config);
  const insertQuery =
    "INSERT INTO users (username, password, is_admin) VALUES (?, ?, ?)";
  const values = [username, password, is_admin];
  try {
    const [result] = await pool.query(insertQuery, values);

    return result;
  } catch (error) {
    throw error;
  }
}

// update password of users:
// example:PUT http://localhost:3001/api/users
// {
//     "username": "John",
//     "oldPassword": "Doe",
//     "newPassword": "newsecretpassword"
//   }
router.put("/", async (req, res) => {
  const { username, oldPassword, newPassword } = req.body;

  if (!username || !oldPassword || !newPassword) {
    return res
      .status(400)
      .send({ error: "Invalid request. Missing required fields." });
  }

  checkOldPassword(username, oldPassword)
    .then((results) => {
      updateNewPassword(username, newPassword)
        .then((resul) => {
          res.status(200).send({ status: "Password updated successfully." });
        })
        .catch((err) => {
          console.error("error with updating the user password", err);
          res.status(500).send("error with updating the user password");
        });
    })
    .catch((err) => {
      console.error(err);
      res
        .status(409)
        .send(err, "error with matching the username to the password");
    });
});

async function updateNewPassword(username, newPassword) {
  const pool = mysql.createPool(config);
  const updateQuery = "UPDATE users SET password = ? WHERE username = ?";
  const values = [newPassword, username];
  try {
    const [result] = await pool.query(updateQuery, values);
    return result;
  } catch (error) {
    throw error;
  }
}

async function checkOldPassword(username, oldPassword) {
  const pool = mysql.createPool(config);
  const selectQuery = "SELECT password FROM users WHERE username = ?";
  let err;
  try {
    const [result] = await pool.query(selectQuery, [username]);

    if (result.length === 0) {
      err = "User not found. Incorrect username.";
      throw new Error(err);
    }

    const storedPassword = result[0].password;

    if (storedPassword !== oldPassword) {
      err = "Incorrect old password. Password not updated.";
      throw new Error(err);
    }
  } catch (error) {
    return err;
  }
}

module.exports = router;

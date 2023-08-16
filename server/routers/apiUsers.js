const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");
const config = require("../dbconfig");
const apiFunctions = require("./apiFuncions");
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
router.post("/", async (req, res) => {
  try {
    const newUser = req.body;

    if (
      !newUser.username ||
      !newUser.password ||
      newUser.is_admin === undefined
    ) {
      return res.status(400).send({ error: "Invalid user data" });
    }

    const is_admin = newUser.is_admin ? 1 : 0;

    const usernameExists = await checkUsernameExists(newUser.username);

    if (usernameExists) {
      return res.status(409).send({
        error: "The username already exists. Please choose another username.",
      });
    }

    await createUser(newUser.username, newUser.password, is_admin);

    res.status(200).send("The user added successfully!");
  } catch (err) {
    console.error("Error processing user data", err);
    res
      .status(500)
      .send({ error: "An error occurred while processing user data." });
  }
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

  try {
    const isValidUser = await apiFunctions.checkUserAndPassword(
      username,
      oldPassword
    );

    if (!isValidUser) {
      return res
        .status(404)
        .send({ error: "User not found or the password is wrong" });
    }

    const updateResult = await updateNewPassword(username, newPassword);
    console.log(updateResult);
    res.status(200).send({ result: "Password updated successfully." });
  } catch (err) {
    console.error("An error occurred:", err);
    res
      .status(500)
      .send({ error: "An error occurred while processing the request." });
  }
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

// async function checkOldPassword(username, oldPassword) {
//   const pool = mysql.createPool(config);
//   const selectQuery = "SELECT password FROM users WHERE username = ?";

//   try {
//     const [result] = await pool.query(selectQuery, [username]);

//     if (result.length === 0) {
//       throw new Error("User not found. Incorrect username.");
//     }

//     const storedPassword = result[0].password;

//     if (storedPassword !== oldPassword) {
//       throw new Error("Incorrect old password. Password not updated.");
//     }
//   } catch (error) {
//     throw error; // Re-throw the error object
//   }
// }

module.exports = router;

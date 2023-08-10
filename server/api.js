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

//http://localhost:3001/items/type?type=Skirt
app.get("/items/type", (req, res) => {
  const itemType = req.query.type;

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
});
//get a specific item according to the id
//http://localhost:3001/items/1
app.get("/items/:item_id", (req, res) => {
  const itemId = req.params.item_id;

  const query = "SELECT * FROM items WHERE item_id = ?";
  con.query(query, [itemId], (err, results) => {
    if (err) {
      console.error("Error in request execution", err);
      return res
        .status(500)
        .send({ error: "An error occurred while fetching the item." });
    }

    // If no item is found with the specified item_id, return a 404 status
    if (results.length === 0) {
      return res.status(404).send({ error: "Item not found." });
    }

    // If item is found, send the item object in the response
    res.status(200).send(results[0]);
  });
});

// {
//     "item_description": "Updated Shirt",
//     "type": "Shirt",
//     "image": null
//   }
//http://localhost:3001/items/1
//update item attributes ***** option for a manager****
app.put("/items/:item_id", (req, res) => {
  const itemId = req.params.item_id;
  const newItem = req.body;

  // Check if the 'item_id' parameter is a valid integer
  if (isNaN(itemId) || parseInt(itemId) <= 0) {
    return res
      .status(400)
      .send({ error: "Invalid item_id. Please provide a valid integer." });
  }

  // Validate that newItem contains at least one attribute to update
  if (Object.keys(newItem).length === 0) {
    return res
      .status(400)
      .send({ error: "Invalid request. No attributes provided for update." });
  }

  const updateQuery = "UPDATE items SET ? WHERE item_id = ?";
  con.query(updateQuery, [newItem, itemId], (err, updateResult) => {
    if (err) {
      console.error("Error in request execution", err);
      return res
        .status(500)
        .send({ error: "An error occurred while updating the item." });
    }

    // Check if any rows were affected by the update
    if (updateResult.affectedRows === 0) {
      return res
        .status(404)
        .send({ error: "Item not found. No update performed." });
    }

    // Item successfully updated, fetch and return the updated item
    const selectQuery = "SELECT * FROM items WHERE item_id = ?";
    con.query(selectQuery, [itemId], (err, results) => {
      if (err) {
        console.error("Error in request execution", err);
        return res.status(500).send({
          error: "An error occurred while fetching the updated item.",
        });
      }

      // If the updated item is found, send the item object in the response
      res.status(200).send(results[0]);
    });
  });
});

//adding an item , it use the function addDefaultAmountForSizes to add defualt lines to the new item.
//*****  option for the manager ****** */
app.post("/items", (req, res) => {
  const newItem = req.body;

  // Validate the newItem object to ensure it has the required properties
  if (!newItem.item_description || !newItem.type) {
    return res
      .status(400)
      .send({ error: "item_description and type are required fields." });
  }

  const insertQuery =
    "INSERT INTO items (item_description, type, image) VALUES (?, ?, ?)";
  con.query(
    insertQuery,
    [newItem.item_description, newItem.type, newItem.image],
    (err, insertResult) => {
      if (err) {
        console.error("Error in request execution", err);
        return res
          .status(500)
          .send({ error: "An error occurred while adding the item." });
      }

      // Get the item_id of the newly inserted item
      const newItemId = insertResult.insertId;

      // Call the addDefaultAmountForSizes function to add amount lines for the new item_id
      addDefaultAmountForSizes(newItemId)
        .then((message) => {
          console.log(message); // Log the success message if amount lines were added successfully
          res.status(201).send({
            success: true,
            message: "Item and amount lines added successfully.",
          });
        })
        .catch((error) => {
          console.error(error.message); // Handle any errors from addDefaultAmountForSizes
          res.status(201).send({
            success: true,
            message: "Item added, but amount lines could not be added.",
          });
        });
    }
  );
});

app.delete("/items/:item_id", (req, res) => {
  const item_id = req.params.item_id;

  // Call deleteAllSizes function to delete all sizes of the item from the amount table
  deleteAllSizes(item_id, (err, sizesDeleted) => {
    if (err) {
      // If there's an error in deleting sizes, respond with an error status
      console.error("Error deleting sizes:", err);
      return res
        .status(500)
        .send({ error: "An error occurred while deleting sizes." });
    }

    if (sizesDeleted) {
      // Item sizes deleted successfully from the amount table, proceed with deleting from items table
      const deleteItemQuery = "DELETE FROM items WHERE item_id = ?";
      con.query(deleteItemQuery, [item_id], (err, deleteResult) => {
        if (err) {
          console.error("Error deleting item:", err);
          return res
            .status(500)
            .send({ error: "An error occurred while deleting the item." });
        }

        // Check if any rows were affected by the delete operation
        if (deleteResult.affectedRows > 0) {
          // Item successfully deleted
          res
            .status(200)
            .send({ success: true, message: "Item deleted successfully." });
        } else {
          // If no rows were affected, the item does not exist in the items table
          res.status(404).send({ error: "The item does not exist." });
        }
      });
    } else {
      // Item sizes were not deleted, but item still exists in the items table
      res
        .status(500)
        .send({ error: "Deletion process failed. Item still exists." });
    }
  });
});

//####################     amount        ##############################

//http://localhost:3001/amount/1
//gives all the sizes and there amount according a specific item id
app.get("/amount/:item_id", (req, res) => {
  const itemId = req.params.item_id;

  // Check if the 'item_id' parameter is a valid integer
  if (isNaN(itemId) || parseInt(itemId) <= 0) {
    return res
      .status(400)
      .send({ error: "Invalid item_id. Please provide a valid integer." });
  }

  const query = "SELECT size, amount FROM amount WHERE item_id = ?";
  con.query(query, [itemId], (err, results) => {
    if (err) {
      console.error("Error in request execution", err);
      return res
        .status(500)
        .send({ error: "An error occurred while fetching the item amounts." });
    }

    // If no amounts are found for the specified item_id, return a 404 status
    if (results.length === 0) {
      return res.status(404).send({ error: "Item amounts not found." });
    }

    // Item amounts found, send the amounts and sizes in the response
    res.status(200).send(results);
  });
});
// get the amount according the item id and a specific size
//http://localhost:3001/amount/1/1
app.get("/amount/:item_id/:size", (req, res) => {
  const itemId = req.params.item_id;
  const size = req.params.size;

  // Check if the 'item_id' and 'size' parameters are valid integers
  if (
    isNaN(itemId) ||
    parseInt(itemId) <= 0 ||
    isNaN(size) ||
    parseInt(size) <= 0
  ) {
    return res.status(400).send({
      error: "Invalid item_id or size. Please provide valid integers.",
    });
  }

  const query = "SELECT amount FROM amount WHERE item_id = ? AND size = ?";
  con.query(query, [itemId, size], (err, results) => {
    if (err) {
      console.error("Error in request execution", err);
      return res
        .status(500)
        .send({ error: "An error occurred while fetching the item amount." });
    }

    // If no amount is found for the specified item_id and size, return a 404 status
    if (results.length === 0) {
      return res.status(404).send({ error: "Item amount not found." });
    }

    // Item amount found, send the amount in the response
    res.status(200).send({ amount: results[0].amount });
  });
});
//update the amount for a given item_id and size
// http://localhost:3001/amount/1/1
// {
//   "amount": 20
// }

app.put("/amount/:item_id/:size", (req, res) => {
  const itemId = req.params.item_id;
  const size = req.params.size;
  const updatedAmount = req.body.amount;

  // Check if the 'item_id', 'size', and 'amount' parameters are valid integers
  if (
    isNaN(itemId) ||
    parseInt(itemId) <= 0 ||
    isNaN(size) ||
    parseInt(size) <= 0 ||
    isNaN(updatedAmount) ||
    parseInt(updatedAmount) < 0
  ) {
    return res.status(400).send({
      error: "Invalid item_id, size, or amount. Please provide valid integers.",
    });
  }

  const updateQuery =
    "UPDATE amount SET amount = ? WHERE item_id = ? AND size = ?";
  con.query(updateQuery, [updatedAmount, itemId, size], (err, updateResult) => {
    if (err) {
      console.error("Error in request execution", err);
      return res
        .status(500)
        .send({ error: "An error occurred while updating the item amount." });
    }

    // Check if any rows were affected by the update
    if (updateResult.affectedRows === 0) {
      return res
        .status(404)
        .send({ error: "Item amount not found. No update performed." });
    }

    // Item amount updated successfully
    res
      .status(200)
      .send({ success: true, message: "Item amount updated successfully." });
  });
});

//function for updating the amount. when adding to the cart we will get -1 in the amount. delete in the cart we will get +1 in the amount
function updateAmount(itemId, size, operation) {
  // Check if the 'item_id' and 'size' parameters are valid integers
  if (
    isNaN(itemId) ||
    parseInt(itemId) <= 0 ||
    isNaN(size) ||
    parseInt(size) <= 0
  ) {
    return Promise.reject(
      new Error("Invalid item_id or size. Please provide valid integers.")
    );
  }

  // Check if the 'operation' parameter is valid
  if (operation !== "+" && operation !== "-") {
    return Promise.reject(
      new Error(
        "Invalid operation. Please provide '+' for increment or '-' for decrement."
      )
    );
  }

  const updateQuery = `UPDATE amount SET amount = amount ${
    operation === "+" ? "+" : "-"
  } 1 WHERE item_id = ? AND size = ?`;
  return new Promise((resolve, reject) => {
    con.query(updateQuery, [itemId, size], (err, updateResult) => {
      if (err) {
        console.error("Error in request execution", err);
        reject(new Error("An error occurred while updating the item amount."));
      } else {
        // Check if any rows were affected by the update
        if (updateResult.affectedRows === 0) {
          reject(new Error("Item amount not found. No update performed."));
        } else {
          resolve("Item amount updated successfully.");
        }
      }
    });
  });
}

// updateAmount(itemId, size, '+')
//   .then((message) => {
//     console.log(message); // "Item amount updated successfully."
//   })
//   .catch((error) => {
//     console.error(error.message); // Handle any errors here
//   });

// // Or for decrementing the amount
// updateAmount(itemId, size, '-')
//   .then((message) => {
//     console.log(message); // "Item amount updated successfully."
//   })
//   .catch((error) => {
//     console.error(error.message); // Handle any errors here
//   });

//this function gets an item id and it adds a line for each of  the sizes 34, 36, 38 , 40 , 42  with the defult amount value 5
//when we add an item by defalt the amounts of the sizes will be added
function addDefaultAmountForSizes(itemId) {
  // Check if the 'item_id' parameter is a valid integer
  if (isNaN(itemId) || parseInt(itemId) <= 0) {
    return Promise.reject(
      new Error("Invalid item_id. Please provide a valid integer.")
    );
  }

  const sizes = [34, 36, 38, 40, 42];
  const insertQuery =
    "INSERT INTO amount (item_id, size, amount) VALUES (?, ?, 5)";

  return new Promise((resolve, reject) => {
    // Loop through each size and execute the insert query
    sizes.forEach((size) => {
      con.query(insertQuery, [itemId, size], (err, insertResult) => {
        if (err) {
          console.error("Error in request execution", err);
          reject(new Error("An error occurred while adding amount lines."));
        }
        // The insert query was successful for the current size
        // If you want to do something with the insertResult, you can handle it here
      });
    });

    // All insert queries have been executed successfully
    resolve("Amount lines added successfully.");
  });
}

function deleteAllSizes(item_id, callback) {
  const deleteQuery = "DELETE FROM amount WHERE item_id = ?";
  const checkItemQuery = "SELECT item_id FROM items WHERE item_id = ?";

  con.query(deleteQuery, [item_id], (err, result) => {
    if (err) {
      console.error("Error in deleting sizes:", err);
      return callback(err);
    }

    const affectedRows = result.affectedRows;
    console.log(`Deleted ${affectedRows} rows for item_id ${item_id}`);

    con.query(checkItemQuery, [item_id], (err, itemResult) => {
      if (err) {
        console.error("Error checking item existence:", err);
        return callback(err);
      }

      if (itemResult.length === 0) {
        console.log(
          `Deleted rows for item_id ${item_id}. Item does not exist.`
        );
        return callback(null, true);
      } else {
        return callback(null, false);
      }
    });
  });
}

//####################     liked       ##############################

app.get("/loved/:username", (req, res) => {
  // Get the username from the URL parameter
  const username = req.params.username;

  const selectItemsQuery1 = `
      SELECT i.*
      FROM items i
      JOIN liked l ON i.item_id = l.item_id
      WHERE l.username = ?;
    `;

  con.query(selectItemsQuery1, [username], (err, items) => {
    if (err) {
      console.error("Error fetching liked items:", err);
      // Handle the error
      return res
        .status(500)
        .json({ error: "An error occurred while fetching liked items." });
    } else {
      // Send the fetched items array in the response
      res.status(200).json(items);
    }
  });
});

//http://localhost:3001/liked/John123/1
//adding a liked item to the db
app.post("/liked/:username/:item_id", (req, res) => {
  const { username, item_id } = req.params;

  // Insert a new row into the 'liked' table
  const insertQuery = "INSERT INTO liked (item_id, username) VALUES (?, ?)";
  con.query(insertQuery, [item_id, username], (err, result) => {
    if (err) {
      console.error("Error adding liked item:", err);
      return res
        .status(500)
        .send({ error: "An error occurred while adding the liked item." });
    }

    // Check if any rows were affected by the insert operation
    if (result.affectedRows === 0) {
      return res.status(500).send({ error: "Failed to add liked item." });
    }

    // Liked item successfully added
    res
      .status(201)
      .send({ success: true, message: "Liked item added successfully." });
  });
});
//http://localhost:3001/liked/John123/4
//cansle a liked item (delete from the liked table)
app.delete("/liked/:username/:item_id", (req, res) => {
  const { username, item_id } = req.params;

  // Delete the row from the 'liked' table
  const deleteQuery = "DELETE FROM liked WHERE username = ? AND item_id = ?";
  con.query(deleteQuery, [username, item_id], (err, result) => {
    if (err) {
      console.error("Error deleting liked item:", err);
      return res
        .status(500)
        .send({ error: "An error occurred while deleting the liked item." });
    }

    // Check if any rows were affected by the delete operation
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .send({ error: "Liked item not found or invalid input provided." });
    }

    // Liked item successfully deleted
    res
      .status(200)
      .send({ success: true, message: "Liked item deleted successfully." });
  });
});

// // Assuming 'itemId' is a valid integer
// addDefaultAmountForSizes(itemId)
//   .then((message) => {
//     console.log(message); // "Amount lines added successfully."
//   })
//   .catch((error) => {
//     console.error(error.message); // Handle any errors here
//   });

app.listen(3001, () => {
  console.log("app listening on port 3001.");
  console.log("http://localhost:3001/");
});

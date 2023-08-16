const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");
const config = require("../dbconfig");
const apiFunctions = require("./apiFuncions");

// GET /api/items
// example: http://localhost:3001/api/items
//get all the items in the db

router.get("/", (req, res) => {
  getItems()
    .then((results) => {
      if (results.length === 0) {
        return res.status(200).send([]);
      }
      res.status(200).send(results);
    })
    .catch((err) => {
      console.error("Error in request execution", err);
      res.status(500).send({ error: "Error in request execution" });
    });
});

async function getItems() {
  const pool = mysql.createPool(config);
  const query = `SELECT * FROM items`;

  try {
    const [results] = await pool.query(query);
    return results;
  } catch (error) {
    throw error;
  }
}
// GET /api/items/type
//http://localhost:3001/items/api/type?type=Skirt
router.get("/type", (req, res) => {
  const itemType = req.query.type;
  getItem(itemType)
    .then((results) => {
      if (results.length === 0) {
        return res.status(200).send([]);
      }
      res.status(200).send(results);
    })
    .catch((err) => {
      console.error("Error in request execution", err);
      res.status(500).send({ error: "Error in request execution" });
    });
});

async function getItem(itemType) {
  const pool = mysql.createPool(config);
  const query = `SELECT * FROM items WHERE type = ?`;
  try {
    const [results] = await pool.query(query, [itemType]);
    return results;
  } catch (error) {
    throw error;
  }
}
// GET /api/items/:item_id
//get a specific item according to the id
//http://localhost:3001/api/items/1
router.get("/:item_id", (req, res) => {
  const itemId = req.params.item_id;
  getItemDetails(itemId)
    .then((results) => {
      if (results.length === 0) {
        return res.status(404).send({ error: "Item not found" });
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

async function getItemDetails(itemId) {
  const pool = mysql.createPool(config);
  const query = `SELECT * FROM items WHERE item_id = ?`;

  try {
    const [results] = await pool.query(query, [itemId]);
    return results;
  } catch (error) {
    throw error;
  }
}

// {
//     "item_description": "Updated Shirt",
//     "type": "Shirt",
//     "image": null
//   }
//PUT http://localhost:3001/items/1
//update item attributes ***** option for a manager****
router.put("/:username/:item_id", async (req, res) => {
  const username = req.params.username;
  const itemId = req.params.item_id;
  const newItem = req.body;

  if (!itemId || !newItem) {
    return res
      .status(400)
      .send({ error: "Invalid request. Missing required fields." });
  }

  try {
    const isManager = await apiFunctions.isManager(username);
    console.log(isManager);
    if (!isManager) {
      return res
        .status(200)
        .send({ error: "The user is not a manager so he can't update items!" });
    }

    const [isValidItem] = await getItemDetails(itemId);
    console.log(isValidItem);
    if (!isValidItem) {
      return res.status(404).send({ error: "The item id wasn't found" });
    }

    const updateResult = await updateNewItem(itemId, newItem);
    console.log(updateResult);
    res.status(200).send({ result: "Item updated successfully." });
  } catch (err) {
    console.error("An error occurred:", err);
    res
      .status(500)
      .send({ error: "An error occurred while processing the request." });
  }
});

async function updateNewItem(itemId, newItem) {
  try {
    const pool = mysql.createPool(config);
    const updateQuery = "UPDATE items SET ? WHERE item_id = ?";
    const values = [newItem, itemId];

    const [result] = await pool.query(updateQuery, values);
    return result;
  } catch (error) {
    throw error;
  }
}
// POST /api/items
router.post("/", (req, res) => {
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

// DELETE /api/items/:item_id
router.delete("/:item_id", (req, res) => {
  // Your route logic here
});

// Define other routes for items here

module.exports = router;
//####################     items        ##############################

//adding an item , it use the function addDefaultAmountForSizes to add defualt lines to the new item.
//*****  option for the manager ****** */

// app.delete("/items/:item_id", (req, res) => {
//   const item_id = req.params.item_id;

//   // Call deleteAllSizes function to delete all sizes of the item from the amount table
//   deleteAllSizes(item_id, (err, sizesDeleted) => {
//     if (err) {
//       // If there's an error in deleting sizes, respond with an error status
//       console.error("Error deleting sizes:", err);
//       return res
//         .status(500)
//         .send({ error: "An error occurred while deleting sizes." });
//     }

//     if (sizesDeleted) {
//       // Item sizes deleted successfully from the amount table, proceed with deleting from items table
//       const deleteItemQuery = "DELETE FROM items WHERE item_id = ?";
//       con.query(deleteItemQuery, [item_id], (err, deleteResult) => {
//         if (err) {
//           console.error("Error deleting item:", err);
//           return res
//             .status(500)
//             .send({ error: "An error occurred while deleting the item." });
//         }

//         // Check if any rows were affected by the delete operation
//         if (deleteResult.affectedRows > 0) {
//           // Item successfully deleted
//           res
//             .status(200)
//             .send({ success: true, message: "Item deleted successfully." });
//         } else {
//           // If no rows were affected, the item does not exist in the items table
//           res.status(404).send({ error: "The item does not exist." });
//         }
//       });
//     } else {
//       // Item sizes were not deleted, but item still exists in the items table
//       res
//         .status(500)
//         .send({ error: "Deletion process failed. Item still exists." });
//     }
//   });
// });

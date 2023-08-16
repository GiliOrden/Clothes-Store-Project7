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
//*****  option for the manager ****** */
router.post("/:username", async (req, res) => {
  const newItem = req.body;
  const username = req.params.username;
  if (!newItem.item_description || !newItem.type) {
    return res
      .status(400)
      .send({ error: "item_description and type are required fields." });
  }

  try {
    const isManager = await apiFunctions.isManager(username);
    if (!isManager) {
      return res
        .status(200)
        .send({ error: "The user is not a manager so he can't add items!" });
    }

    await createItem(newItem);

    res.status(200).send("The item added successfully!");
  } catch (err) {
    console.error("Error processing item data", err);
    res
      .status(500)
      .send({ error: "An error occurred while processing item data." });
  }
});

async function createItem(newItem) {
  const pool = mysql.createPool(config);
  const query = `INSERT INTO items (item_description, type, image) VALUES (?, ?, ?)`;
  const values = [newItem.item_description, newItem.type, newItem.image];
  try {
    const [result] = await pool.query(query, values);

    return result;
  } catch (error) {
    throw error;
  }
}

// DELETE /api/items/:item_id

// Define other routes for items here

module.exports = router;
//####################     items        ##############################

router.delete("/:username/:item_id", async (req, res) => {
  const username = req.params.username;
  const item_id = req.params.item_id;
  try {
    const isManager = await apiFunctions.isManager(username);
    if (!isManager) {
      return res
        .status(200)
        .send({ error: "The user is not a manager so he can't add items!" });
    }
    deleteAllSizes(item_id, async (err, sizesDeleted) => {
      if (err) {
        console.error("Error deleting sizes:", err);
        return res
          .status(500)
          .send({ error: "An error occurred while deleting sizes." });
      }

      if (sizesDeleted) {
        await deleteItem(newItem);
        res.status(200).send("The item deleted successfully!");
      }
    });
  } catch (err) {
    console.error("Error while deleting item data", err);
    res.status(500).send({ error: "Error while deleting item data." });
  }
});

async function deleteAllSizes(item_id) {
  const pool = mysql.createPool(config);

  const deleteCart = "DELETE FROM cart WHERE item_id = ?";
  const deleteAmount = "DELETE FROM amount WHERE item_id = ?";
  const deleteLiked = "DELETE FROM liked WHERE item_id = ?";
  try {
    const [result] = await pool.query(deleteCart, [item_id]);
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .send({ error: "Cart item not found or invalid input provided." });
    }
    return result;
  } catch (error) {
    throw error;
  }
}
async function deleteItem(item_id) {
  const pool = mysql.createPool(config);
  const deleteQuery = "DELETE FROM items WHERE item_id = ?";
  try {
    const [result] = await pool.query(deleteQuery, [item_id]);

    return result;
  } catch (error) {
    throw error;
  }
}

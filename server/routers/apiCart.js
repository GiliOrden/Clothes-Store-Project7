const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");
const config = require("../dbconfig");
const apiFunctions = require("./apiFuncions");
const dbconfig = require("../dbconfig");

router.get("/:username", async (req, res) => {
  const pool = mysql.createPool(config);
  const username = req.params.username;
  const query = `
      SELECT i.*, size
      FROM items i
      JOIN cart c ON i.item_id = c.item_id
      WHERE c.username = ?;
    `;
  const values = [username];

  try {
    const [results] = await pool.query(query, values);
    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching cart items:", err);
    res
      .status(500)
      .json({ error: "An error occurred while fetching cart items." });
  }
});

//http://localhost:3001/cart/John123/1
//adding a cart item to the db
router.post("/:username/:item_id", async (req, res) => {
  const pool = mysql.createPool(dbconfig);
  const { username, item_id } = req.params;
  const size = "XS"; //?
  const insertQuery =
    "INSERT IGNORE INTO cart (item_id, username, size) VALUES (?, ?, ?)";

  try {
    const [results] = await pool.query(insertQuery, [item_id, username, size]);
    console.log(results);
    if (results.affectedRows === 0) {
      return res.status(500).send({ error: "Failed to add cart item." });
    }

    res
      .status(201)
      .send({ success: true, message: "Cart item added successfully." });
  } catch (error) {
    console.error("Error adding cart item:", error);
    return res
      .status(500)
      .send({ error: "An error occurred while adding the cart item." });
  }
});
//http://localhost:3001/cart/John123/4
//cansle a cart item (delete from the cart table)
router.delete("/:username/:item_id", async (req, res) => {
  const pool = mysql.createPool(dbconfig);
  const { username, item_id } = req.params;
  const size = "M"; //?
  try {
    const deleteQuery =
      "DELETE FROM cart WHERE username = ? AND item_id = ? AND size = ?";
    const [result] = await pool.query(deleteQuery, [username, item_id, size]);
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .send({ error: "Cart item not found or invalid input provided." });
    }

    // Cart item successfully deleted
    res
      .status(200)
      .send({ success: true, message: "Cart item deleted successfully." });
  } catch (error) {
    console.error("Error deleting cart item:", error);
    return res
      .status(500)
      .send({ error: "An error occurred while deleting the cart item." });
  }
});

module.exports = router;

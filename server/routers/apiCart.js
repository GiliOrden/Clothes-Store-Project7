const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");
const config = require("../dbconfig");
const checkUserAndPassword = require("./apiFuncions").checkUserAndPassword;

router.get("/", async (req, res) => {
  const pool = mysql.createPool(config);
  const { username, password } = req.query;
  if (
    !username ||
    !password ||
    !(await checkUserAndPassword(username, password))
  ) {
    return res.status(403).json({ error: "Not valid user" });
  }
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
  const pool = mysql.createPool(config);
  const { username, item_id } = req.params;
  const { password } = req.body;
  if (
    !username ||
    !password ||
    !(await checkUserAndPassword(username, password))
  ) {
    return res.status(403).json({ error: "Not valid user" });
  }
  const size = "XS"; //?
  const insertQuery =
    "INSERT IGNORE INTO cart (item_id, username, size) VALUES (?, ?, ?)";

  try {
    const [results] = await pool.query(insertQuery, [item_id, username, size]);
    if (results.affectedRows === 0) {
      return res.status(500).send({ error: "Failed to add cart item." });
    }
    await updateAmount(item_id, size, "-");
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
  const pool = mysql.createPool(config);
  const { username, item_id } = req.params;
  const { password } = req.body;
  if (
    !username ||
    !password ||
    !(await checkUserAndPassword(username, password))
  ) {
    return res.status(403).json({ error: "Not valid user" });
  }
  const size = "XS"; //?
  try {
    const deleteQuery =
      "DELETE FROM cart WHERE username = ? AND item_id = ? AND size = ?";
    const [result] = await pool.query(deleteQuery, [username, item_id, size]);
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .send({ error: "Cart item not found or invalid input provided." });
    }
    await updateAmount(item_id, size, "+");
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

//function for updating the amount. when adding to the cart we will get -1 in the amount. delete in the cart we will get +1 in the amount
async function updateAmount(itemId, size, operation) {
  const pool = mysql.createPool(config);
  // Check if the 'item_id' and 'size' parameters are valid integers
  if (isNaN(itemId) || parseInt(itemId) <= 0) {
    throw new Error("Invalid item_id or size. Please provide valid integers.");
  }

  if (operation !== "+" && operation !== "-") {
    throw new Error(
      "Invalid operation. Please provide '+' for increment or '-' for decrement."
    );
  }

  const updateQuery = `UPDATE amount SET amount = amount ${
    operation === "+" ? "+" : "-"
  } 1 WHERE item_id = ? AND size = ?`;
  try {
    const [updateResult] = await pool.query(updateQuery, [itemId, size]);
    if (updateResult.affectedRows === 0) {
      throw new Error("Item amount not found. No update performed.");
    }
    return "Item amount updated successfully.";
  } catch (error) {
    console.error("Error in request execution", error);
    throw new Error("An error occurred while updating the item amount.");
  }
}

module.exports = router;

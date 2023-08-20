const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");
const config = require("../dbconfig");
const checkUserAndPassword = require("./apiFuncions").checkUserAndPassword;

router.get("/", async (req, res) => {
  const pool = mysql.createPool(config);
  // Get the username from the URL parameter
  const { username, password } = req.query;
  if (
    !username ||
    !password ||
    !(await checkUserAndPassword(username, password))
  ) {
    return res.status(403).json({ error: "Not valid user" });
  }

  const selectItemsQuery1 = `
  SELECT 
  i.*,
  COALESCE(subquery_available.availableSizes, JSON_ARRAY()) AS availableSizes,
  COALESCE(subquery_outofstock.outOfStockSizes, JSON_ARRAY()) AS outOfStockSizes
FROM items i
JOIN liked l ON i.item_id = l.item_id
LEFT JOIN (
  SELECT 
    items.item_id,
    JSON_ARRAYAGG(size) AS availableSizes
  FROM items
  JOIN amount ON items.item_id = amount.item_id
  WHERE amount.amount > 0
  GROUP BY items.item_id
) AS subquery_available ON i.item_id = subquery_available.item_id
LEFT JOIN (
  SELECT 
    items.item_id,
    JSON_ARRAYAGG(size) AS outOfStockSizes
  FROM items
  JOIN amount ON items.item_id = amount.item_id
  WHERE amount.amount = 0
  GROUP BY items.item_id
) AS subquery_outofstock ON i.item_id = subquery_outofstock.item_id
WHERE l.username = ?;



    `;

  try {
    const [results] = await pool.query(selectItemsQuery1, [username]);
    const results2 =  results.map((item) => ({
      ...item,
      image: `${req.protocol}://${req.get("host")}/${item.image}`,
    }));
    res.status(200).json(results2);
  } catch (error) {
    console.error("Error fetching liked items:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching liked items." });
  }
});

//http://localhost:3001/liked/John123/1
//adding a liked item to the db
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

  // Insert a new row into the 'liked' table
  ///////////////////////אם קיים?
  const insertQuery = "INSERT INTO liked (item_id, username) VALUES (?, ?)";
  try {
    const [result] = await pool.query(insertQuery, [item_id, username]);
    if (result.affectedRows === 0) {
      return res.status(500).send({ error: "Failed to add liked item." });
    }
    res
      .status(201)
      .send({ success: true, message: "Liked item added successfully." });
  } catch (error) {
    console.error("Error adding liked item:", error);
    return res
      .status(500)
      .send({ error: "An error occurred while adding the liked item." });
  }
});
//http://localhost:3001/liked/John123/4
//cansle a liked item (delete from the liked table)
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

  // Delete the row from the 'liked' table
  const deleteQuery = "DELETE FROM liked WHERE username = ? AND item_id = ?";
  try {
    const [result] = await pool.query(deleteQuery, [username, item_id]);
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .send({ error: "Liked item not found or invalid input provided." });
    }
    res
      .status(200)
      .send({ success: true, message: "Liked item deleted successfully." });
  } catch (error) {
    console.error("Error deleting liked item:", err);
    return res
      .status(500)
      .send({ error: "An error occurred while deleting the liked item." });
  }
});

module.exports = router;

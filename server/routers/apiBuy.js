const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");
const config = require("../dbconfig");
const checkUserAndPassword = require("./apiFuncions").checkUserAndPassword;

router.post("/", async (req, res) => {
  const pool = mysql.createPool(config);
  const { username, password } = req.query;
  if (
    !username ||
    !password ||
    !(await checkUserAndPassword(username, password))
  ) {
    return res.status(403).json({ error: "Not valid user" });
  }
  const query1 = `INSERT INTO sales (username, purchased_items, total_amount, purchase_date)
  SELECT
      c.username,
      GROUP_CONCAT(CONCAT(i.item_description, ' (', c.size, ')') SEPARATOR ', ') AS purchased_items,
      SUM(i.price) AS total_amount,
      NOW() AS purchase_date
  FROM cart c
  JOIN items i ON c.item_id = i.item_id
  WHERE c.username = ?
  GROUP BY c.username;
  `;
  const query2 = `DELETE FROM cart WHERE username = ?;`;
  const values = [username];

  try {
    const [result1] = await pool.query(query1, values);
    const [result2] = await pool.query(query2, values);
    if (result2.affectedRows === 0) {
      return res.status(404).send({ error: "Cart is empty." });
    }

    res
      .status(200)
      .send({ success: true, message: "You bought successfully." });
  } catch (error) {
    console.error("Error fetching cart items:", err);
    res
      .status(500)
      .json({ error: "An error occurred while fetching cart items." });
  }
});

module.exports = router;

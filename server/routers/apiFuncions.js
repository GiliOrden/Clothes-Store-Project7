const mysql = require("mysql2/promise");
var config = require("../dbconfig");

async function checkUserAndPassword(username, password) {
  const pool = mysql.createPool(config);
  const query = `SELECT COUNT(*) > 0 AS user_exists
  FROM users
  WHERE username = ? AND password = ?`;
  const values = [username, password];

  try {
    const [results] = await pool.query(query, values);
    return results;
  } catch (error) {
    throw error;
  }
}
module.exports = {
  checkUserAndPassword: checkUserAndPassword,
};

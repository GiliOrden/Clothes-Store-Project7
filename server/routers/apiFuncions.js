const mysql = require("mysql2/promise");
var config = require("../dbconfig");

async function checkUserAndPassword(username, password) {
  const pool = mysql.createPool(config);
  const query = `SELECT COUNT(*) > 0 AS user_exists
                   FROM users
                   WHERE username = ? AND password = ?`;
  const values = [username, password];

  try {
    const results = await pool.query(query, values);
    const userExists = Boolean(results[0][0].user_exists);
    return userExists;
  } catch (error) {
    throw error;
  }
}
async function isManager(username, password) {
  const pool = mysql.createPool(config);
  const query = `SELECT username
                   FROM users
                   WHERE username = ? AND password = ? AND is_admin = 1`;

  try {
    const [results] = await pool.query(query, [username, password]);
    if (results.length !== 0) {
      return true;
    }

    return false;
  } catch (error) {
    throw error;
  }
}

async function isExistItem(item_id) {
  const pool = mysql.createPool(config);
  const query = `SELECT item_id
                   FROM items
                   WHERE item_id = ?`;

  try {
    const [results] = await pool.query(query, [item_id]);
    if (results.length !== 0) {
      return true;
    }

    return false;
  } catch (error) {
    throw error;
  }
}
module.exports = {
  checkUserAndPassword: checkUserAndPassword,
  isManager: isManager,
  isExistItem: isExistItem,
};

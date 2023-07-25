var config = require("./dbconfig");
const sql = require("mysql2");
//const con = mysql.createConnection(config);
// execute SQL query
function executeQuery(query) {
  return new Promise((resolve, reject) => {
    con.query(query, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

// insert user
async function insertUsers(user) {
  const { username, password, is_admin } = user;

  const query = `INSERT INTO users (username, password, is_admin) VALUES (${username}, '${password}', '${is_admin}')`;
  await executeQuery(query);
}

async function getUser(username, password) {
  const query = `SELECT * FROM users WHERE username = @username_parameter AND password = @password_parameter`;
  try {
    let pool = await sql.connect(config);
    let userDetails = await pool
      .request()
      .input("username_parameter", sql.NVarChar, username)
      .input("password_parameter", sql.NVarChar, password)
      .query(query);

    return userDetails.recordsets;
  } catch (error) {
    console.log("The user or the password is incorrect", error);
  }
}

async function getAllUsers() {
  const query = `SELECT * FROM users`;
  try {
    let con = await sql.createConnection(config);
    let [userDetails] = await con.query(query);
    console.log("hi");
    await con.end();
    return userDetails;
  } catch (error) {
    console.log("There is an error", error);
  }
}

module.exports = {
  getUser: getUser,
  getAllUsers: getAllUsers,
  insertUsers: insertUsers,
};

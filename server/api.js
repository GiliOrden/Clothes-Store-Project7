const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
var config = require("./dbconfig");

const app = express();
app.use(express.json());
app.use(cors());

// Database connection setup
const con = mysql.createConnection(config);

con.connect((err) => {
  if (err) {
    console.error("Error in connection to database", err);
    return;
  }
  console.log("Connected to the database in api");
});

// Initial route
app.get("/", (req, res) => {
  res.send("Connected to the database and server");
});

// Other routes
const apiUsersRouter = require("./routers/apiUsers");
const apiItemsRouter = require("./routers/apiItems");
const apiAmountRouter = require("./routers/apiAmount");
const apiCartRouter = require("./routers/apiCart");
const apiLikeRouter = require("./routers/apiLike");

app.use("/api/users", apiUsersRouter);
app.use("/api/items", apiItemsRouter);
app.use("/api/amount", apiAmountRouter);
app.use("/api/cart", apiCartRouter);
app.use("/api/like", apiLikeRouter);

// Start the server
app.listen(3001, () => {
  console.log("App listening on port 3001.");
});

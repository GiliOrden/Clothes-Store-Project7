// *******************************************************************************************
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
var config = require("./dbconfig");

const app = express();
app.use(express.json());
app.use(cors());

const con = mysql.createConnection(config);

con.connect((err) => {
  if (err) {
    console.error("Error in connection to database", err);
    return;
  }
  console.log("Connected to the database");
});

app.get("/", (req, res) => {
  res.send("Connected to the data base and server");
});

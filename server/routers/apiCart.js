const express = require("express");
const router = express.Router();
const con = require("../dbconfig");

// GET /api/items
router.get("/", (req, res) => {
  // Your route logic here
});

// GET /api/items/type
router.get("/type", (req, res) => {
  // Your route logic here
});

// GET /api/items/:item_id
router.get("/:item_id", (req, res) => {
  // Your route logic here
});

// POST /api/items
router.post("/", (req, res) => {
  // Your route logic here
});

// PUT /api/items/:item_id
router.put("/:item_id", (req, res) => {
  // Your route logic here
});

// DELETE /api/items/:item_id
router.delete("/:item_id", (req, res) => {
  // Your route logic here
});

// Define other routes for items here

module.exports = router;

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
//####################     liked       ##############################

// app.get("/loved/:username", (req, res) => {
//   // Get the username from the URL parameter
//   const username = req.params.username;

//   const selectItemsQuery1 = `
//       SELECT i.*
//       FROM items i
//       JOIN liked l ON i.item_id = l.item_id
//       WHERE l.username = ?;
//     `;

//   con.query(selectItemsQuery1, [username], (err, items) => {
//     if (err) {
//       console.error("Error fetching liked items:", err);
//       // Handle the error
//       return res
//         .status(500)
//         .json({ error: "An error occurred while fetching liked items." });
//     } else {
//       // Send the fetched items array in the response
//       res.status(200).json(items);
//     }
//   });
// });

// //http://localhost:3001/liked/John123/1
// //adding a liked item to the db
// app.post("/liked/:username/:item_id", (req, res) => {
//   const { username, item_id } = req.params;

//   // Insert a new row into the 'liked' table
//   const insertQuery = "INSERT INTO liked (item_id, username) VALUES (?, ?)";
//   con.query(insertQuery, [item_id, username], (err, result) => {
//     if (err) {
//       console.error("Error adding liked item:", err);
//       return res
//         .status(500)
//         .send({ error: "An error occurred while adding the liked item." });
//     }

//     // Check if any rows were affected by the insert operation
//     if (result.affectedRows === 0) {
//       return res.status(500).send({ error: "Failed to add liked item." });
//     }

//     // Liked item successfully added
//     res
//       .status(201)
//       .send({ success: true, message: "Liked item added successfully." });
//   });
// });
// //http://localhost:3001/liked/John123/4
// //cansle a liked item (delete from the liked table)
// app.delete("/liked/:username/:item_id", (req, res) => {
//   const { username, item_id } = req.params;

//   // Delete the row from the 'liked' table
//   const deleteQuery = "DELETE FROM liked WHERE username = ? AND item_id = ?";
//   con.query(deleteQuery, [username, item_id], (err, result) => {
//     if (err) {
//       console.error("Error deleting liked item:", err);
//       return res
//         .status(500)
//         .send({ error: "An error occurred while deleting the liked item." });
//     }

//     // Check if any rows were affected by the delete operation
//     if (result.affectedRows === 0) {
//       return res
//         .status(404)
//         .send({ error: "Liked item not found or invalid input provided." });
//     }

//     // Liked item successfully deleted
//     res
//       .status(200)
//       .send({ success: true, message: "Liked item deleted successfully." });
//   });
// });

// // // Assuming 'itemId' is a valid integer
// // addDefaultAmountForSizes(itemId)
// //   .then((message) => {
// //     console.log(message); // "Amount lines added successfully."
// //   })
// //   .catch((error) => {
// //     console.error(error.message); // Handle any errors here
// //   });

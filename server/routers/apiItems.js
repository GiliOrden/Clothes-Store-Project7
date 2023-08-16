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
//####################     items        ##############################

//// example: http://localhost:3001/items
////get all the items in the db
// app.get("/items", (req, res) => {
//   const query = "SELECT * FROM items";

//   con.query(query, (err, results) => {
//     if (err) {
//       console.error("Error in request execution", err);
//       return res
//         .status(500)
//         .send({ error: "An error occurred while fetching items." });
//     }

//     // If there are no items in the database, return an empty array
//     if (results.length === 0) {
//       return res.status(200).send([]);
//     }

//     // If items are found, send the items array in the response
//     res.status(200).send(results);
//   });
// });

// //http://localhost:3001/items/type?type=Skirt
// app.get("/items/type", (req, res) => {
//   const itemType = req.query.type;

//   // If 'type' parameter is provided, filter items by the specified type
//   const query = "SELECT * FROM items WHERE type = ?";
//   con.query(query, [itemType], (err, results) => {
//     if (err) {
//       console.error("Error in request execution", err);
//       return res
//         .status(500)
//         .send({ error: "An error occurred while fetching items by type." });
//     }

//     // If there are no items of the specified type in the database, return an empty array
//     if (results.length === 0) {
//       return res.status(200).send([]);
//     }

//     // If items of the specified type are found, send the items array in the response
//     res.status(200).send(results);
//   });
// });
// //get a specific item according to the id
// //http://localhost:3001/items/1
// app.get("/items/:item_id", (req, res) => {
//   const itemId = req.params.item_id;

//   const query = "SELECT * FROM items WHERE item_id = ?";
//   con.query(query, [itemId], (err, results) => {
//     if (err) {
//       console.error("Error in request execution", err);
//       return res
//         .status(500)
//         .send({ error: "An error occurred while fetching the item." });
//     }

//     // If no item is found with the specified item_id, return a 404 status
//     if (results.length === 0) {
//       return res.status(404).send({ error: "Item not found." });
//     }

//     // If item is found, send the item object in the response
//     res.status(200).send(results[0]);
//   });
// });

// // {
// //     "item_description": "Updated Shirt",
// //     "type": "Shirt",
// //     "image": null
// //   }
// //http://localhost:3001/items/1
// //update item attributes ***** option for a manager****
// app.put("/items/:item_id", (req, res) => {
//   const itemId = req.params.item_id;
//   const newItem = req.body;

//   // Check if the 'item_id' parameter is a valid integer
//   if (isNaN(itemId) || parseInt(itemId) <= 0) {
//     return res
//       .status(400)
//       .send({ error: "Invalid item_id. Please provide a valid integer." });
//   }

//   // Validate that newItem contains at least one attribute to update
//   if (Object.keys(newItem).length === 0) {
//     return res
//       .status(400)
//       .send({ error: "Invalid request. No attributes provided for update." });
//   }

//   const updateQuery = "UPDATE items SET ? WHERE item_id = ?";
//   con.query(updateQuery, [newItem, itemId], (err, updateResult) => {
//     if (err) {
//       console.error("Error in request execution", err);
//       return res
//         .status(500)
//         .send({ error: "An error occurred while updating the item." });
//     }

//     // Check if any rows were affected by the update
//     if (updateResult.affectedRows === 0) {
//       return res
//         .status(404)
//         .send({ error: "Item not found. No update performed." });
//     }

//     // Item successfully updated, fetch and return the updated item
//     const selectQuery = "SELECT * FROM items WHERE item_id = ?";
//     con.query(selectQuery, [itemId], (err, results) => {
//       if (err) {
//         console.error("Error in request execution", err);
//         return res.status(500).send({
//           error: "An error occurred while fetching the updated item.",
//         });
//       }

//       // If the updated item is found, send the item object in the response
//       res.status(200).send(results[0]);
//     });
//   });
// });

// //adding an item , it use the function addDefaultAmountForSizes to add defualt lines to the new item.
// //*****  option for the manager ****** */
// app.post("/items", (req, res) => {
//   const newItem = req.body;

//   // Validate the newItem object to ensure it has the required properties
//   if (!newItem.item_description || !newItem.type) {
//     return res
//       .status(400)
//       .send({ error: "item_description and type are required fields." });
//   }

//   const insertQuery =
//     "INSERT INTO items (item_description, type, image) VALUES (?, ?, ?)";
//   con.query(
//     insertQuery,
//     [newItem.item_description, newItem.type, newItem.image],
//     (err, insertResult) => {
//       if (err) {
//         console.error("Error in request execution", err);
//         return res
//           .status(500)
//           .send({ error: "An error occurred while adding the item." });
//       }

//       // Get the item_id of the newly inserted item
//       const newItemId = insertResult.insertId;

//       // Call the addDefaultAmountForSizes function to add amount lines for the new item_id
//       addDefaultAmountForSizes(newItemId)
//         .then((message) => {
//           console.log(message); // Log the success message if amount lines were added successfully
//           res.status(201).send({
//             success: true,
//             message: "Item and amount lines added successfully.",
//           });
//         })
//         .catch((error) => {
//           console.error(error.message); // Handle any errors from addDefaultAmountForSizes
//           res.status(201).send({
//             success: true,
//             message: "Item added, but amount lines could not be added.",
//           });
//         });
//     }
//   );
// });

// app.delete("/items/:item_id", (req, res) => {
//   const item_id = req.params.item_id;

//   // Call deleteAllSizes function to delete all sizes of the item from the amount table
//   deleteAllSizes(item_id, (err, sizesDeleted) => {
//     if (err) {
//       // If there's an error in deleting sizes, respond with an error status
//       console.error("Error deleting sizes:", err);
//       return res
//         .status(500)
//         .send({ error: "An error occurred while deleting sizes." });
//     }

//     if (sizesDeleted) {
//       // Item sizes deleted successfully from the amount table, proceed with deleting from items table
//       const deleteItemQuery = "DELETE FROM items WHERE item_id = ?";
//       con.query(deleteItemQuery, [item_id], (err, deleteResult) => {
//         if (err) {
//           console.error("Error deleting item:", err);
//           return res
//             .status(500)
//             .send({ error: "An error occurred while deleting the item." });
//         }

//         // Check if any rows were affected by the delete operation
//         if (deleteResult.affectedRows > 0) {
//           // Item successfully deleted
//           res
//             .status(200)
//             .send({ success: true, message: "Item deleted successfully." });
//         } else {
//           // If no rows were affected, the item does not exist in the items table
//           res.status(404).send({ error: "The item does not exist." });
//         }
//       });
//     } else {
//       // Item sizes were not deleted, but item still exists in the items table
//       res
//         .status(500)
//         .send({ error: "Deletion process failed. Item still exists." });
//     }
//   });
// });

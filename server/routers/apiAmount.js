const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");
const config = require("../dbconfig");
const checkUserAndPassword = require("./apiFuncions").checkUserAndPassword;

//http://localhost:3001/amount/1
//gives all the sizes and there amount according a specific item id
router.get("/:item_id", async (req, res) => {
  const pool = mys;
  const itemId = req.params.item_id;

  // Check if the 'item_id' parameter is a valid integer
  if (isNaN(itemId) || parseInt(itemId) <= 0) {
    return res
      .status(400)
      .send({ error: "Invalid item_id. Please provide a valid integer." });
  }

  const query = "SELECT size, amount FROM amount WHERE item_id = ?";
  try {
    const [results] = await pool.query(query, [itemId]);

    // If no amounts are found for the specified item_id, return a 404 status
    if (results.length === 0) {
      return res.status(404).send({ error: "Item amounts not found." });
    }

    // Item amounts found, send the amounts and sizes in the response
    res.status(200).send(results);
  } catch (error) {
    console.error("Error in request execution", error);
    return res
      .status(500)
      .send({ error: "An error occurred while fetching the item amounts." });
  }
});

// get the amount according the item id and a specific size
//http://localhost:3001/amount/1/1
router.get("/:item_id/:size", async (req, res) => {
  const pool = mysql.createPool(config);
  const itemId = req.params.item_id;
  const size = req.params.size;

  // Check if the 'item_id' and 'size' parameters are valid integers
  if (
    isNaN(itemId) ||
    parseInt(itemId) <= 0 ||
    isNaN(size) ||
    parseInt(size) <= 0
  ) {
    return res.status(400).send({
      error: "Invalid item_id or size. Please provide valid integers.",
    });
  }

  const query = "SELECT amount FROM amount WHERE item_id = ? AND size = ?";
  try {
    const [results] = await pool.query(query, [itemId, size]);
    if (results.length === 0) {
      return res.status(404).send({ error: "Item amount not found." });
    }

    // Item amount found, send the amount in the response
    res.status(200).send({ amount: results[0].amount });
  } catch (error) {
    console.error("Error in request execution", error);
    return res
      .status(500)
      .send({ error: "An error occurred while fetching the item amount." });
  }
});

//update the amount for a given item_id and size
// http://localhost:3001/amount/1/1
// {
//   "amount": 20
// }

router.put("/:item_id/:size", async (req, res) => {
  const pool = mysql.createPool(config);
  const itemId = req.params.item_id;
  const size = req.params.size;
  const updatedAmount = req.body.amount;

  // Check if the 'item_id', 'size', and 'amount' parameters are valid integers
  if (
    isNaN(itemId) ||
    parseInt(itemId) <= 0 ||
    isNaN(size) ||
    parseInt(size) <= 0 ||
    isNaN(updatedAmount) ||
    parseInt(updatedAmount) < 0
  ) {
    return res.status(400).send({
      error: "Invalid item_id, size, or amount. Please provide valid integers.",
    });
  }

  const updateQuery =
    "UPDATE amount SET amount = ? WHERE item_id = ? AND size = ?";
    try{
      const [updateResult]= await pool.query(updateQuery, [updatedAmount, itemId, size]);
      if (updateResult.affectedRows === 0) {
        return res
          .status(404)
          .send({ error: "Item amount not found. No update performed." });
      }
  
      // Item amount updated successfully
      res
        .status(200)
        .send({ success: true, message: "Item amount updated successfully." });
    }
    catch(error){
      console.error("Error in request execution", err);
      return res
        .status(500)
        .send({ error: "An error occurred while updating the item amount." });
    }
  
});



// updateAmount(itemId, size, '+')
//   .then((message) => {
//     console.log(message); // "Item amount updated successfully."
//   })
//   .catch((error) => {
//     console.error(error.message); // Handle any errors here
//   });

// // Or for decrementing the amount
// updateAmount(itemId, size, '-')
//   .then((message) => {
//     console.log(message); // "Item amount updated successfully."
//   })
//   .catch((error) => {
//     console.error(error.message); // Handle any errors here
//   });




module.exports = router;

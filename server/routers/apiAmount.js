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
//*************************************************** */
//####################     amount        ##############################

//http://localhost:3001/amount/1
//gives all the sizes and there amount according a specific item id
app.get("/amount/:item_id", (req, res) => {
  const itemId = req.params.item_id;

  // Check if the 'item_id' parameter is a valid integer
  if (isNaN(itemId) || parseInt(itemId) <= 0) {
    return res
      .status(400)
      .send({ error: "Invalid item_id. Please provide a valid integer." });
  }

  const query = "SELECT size, amount FROM amount WHERE item_id = ?";
  con.query(query, [itemId], (err, results) => {
    if (err) {
      console.error("Error in request execution", err);
      return res
        .status(500)
        .send({ error: "An error occurred while fetching the item amounts." });
    }

    // If no amounts are found for the specified item_id, return a 404 status
    if (results.length === 0) {
      return res.status(404).send({ error: "Item amounts not found." });
    }

    // Item amounts found, send the amounts and sizes in the response
    res.status(200).send(results);
  });
});
// get the amount according the item id and a specific size
//http://localhost:3001/amount/1/1
app.get("/amount/:item_id/:size", (req, res) => {
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
  con.query(query, [itemId, size], (err, results) => {
    if (err) {
      console.error("Error in request execution", err);
      return res
        .status(500)
        .send({ error: "An error occurred while fetching the item amount." });
    }

    // If no amount is found for the specified item_id and size, return a 404 status
    if (results.length === 0) {
      return res.status(404).send({ error: "Item amount not found." });
    }

    // Item amount found, send the amount in the response
    res.status(200).send({ amount: results[0].amount });
  });
});
//update the amount for a given item_id and size
// http://localhost:3001/amount/1/1
// {
//   "amount": 20
// }

app.put("/amount/:item_id/:size", (req, res) => {
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
  con.query(updateQuery, [updatedAmount, itemId, size], (err, updateResult) => {
    if (err) {
      console.error("Error in request execution", err);
      return res
        .status(500)
        .send({ error: "An error occurred while updating the item amount." });
    }

    // Check if any rows were affected by the update
    if (updateResult.affectedRows === 0) {
      return res
        .status(404)
        .send({ error: "Item amount not found. No update performed." });
    }

    // Item amount updated successfully
    res
      .status(200)
      .send({ success: true, message: "Item amount updated successfully." });
  });
});

//function for updating the amount. when adding to the cart we will get -1 in the amount. delete in the cart we will get +1 in the amount
function updateAmount(itemId, size, operation) {
  // Check if the 'item_id' and 'size' parameters are valid integers
  if (
    isNaN(itemId) ||
    parseInt(itemId) <= 0 ||
    isNaN(size) ||
    parseInt(size) <= 0
  ) {
    return Promise.reject(
      new Error("Invalid item_id or size. Please provide valid integers.")
    );
  }

  // Check if the 'operation' parameter is valid
  if (operation !== "+" && operation !== "-") {
    return Promise.reject(
      new Error(
        "Invalid operation. Please provide '+' for increment or '-' for decrement."
      )
    );
  }

  const updateQuery = `UPDATE amount SET amount = amount ${
    operation === "+" ? "+" : "-"
  } 1 WHERE item_id = ? AND size = ?`;
  return new Promise((resolve, reject) => {
    con.query(updateQuery, [itemId, size], (err, updateResult) => {
      if (err) {
        console.error("Error in request execution", err);
        reject(new Error("An error occurred while updating the item amount."));
      } else {
        // Check if any rows were affected by the update
        if (updateResult.affectedRows === 0) {
          reject(new Error("Item amount not found. No update performed."));
        } else {
          resolve("Item amount updated successfully.");
        }
      }
    });
  });
}

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

//this function gets an item id and it adds a line for each of  the sizes 34, 36, 38 , 40 , 42  with the defult amount value 5
//when we add an item by defalt the amounts of the sizes will be added
function addDefaultAmountForSizes(itemId) {
  // Check if the 'item_id' parameter is a valid integer
  if (isNaN(itemId) || parseInt(itemId) <= 0) {
    return Promise.reject(
      new Error("Invalid item_id. Please provide a valid integer.")
    );
  }

  const sizes = ["XS", "S", "M", "L", "XL"];
  const insertQuery =
    "INSERT INTO amount (item_id, size, amount) VALUES (?, ?, 5)";

  return new Promise((resolve, reject) => {
    // Loop through each size and execute the insert query
    sizes.forEach((size) => {
      con.query(insertQuery, [itemId, size], (err, insertResult) => {
        if (err) {
          console.error("Error in request execution", err);
          reject(new Error("An error occurred while adding amount lines."));
        }
        // The insert query was successful for the current size
        // If you want to do something with the insertResult, you can handle it here
      });
    });

    // All insert queries have been executed successfully
    resolve("Amount lines added successfully.");
  });
}

function deleteAllSizes(item_id, callback) {
  const deleteQuery = "DELETE FROM amount WHERE item_id = ?";
  const checkItemQuery = "SELECT item_id FROM items WHERE item_id = ?";

  con.query(deleteQuery, [item_id], (err, result) => {
    if (err) {
      console.error("Error in deleting sizes:", err);
      return callback(err);
    }

    const affectedRows = result.affectedRows;
    console.log(`Deleted ${affectedRows} rows for item_id ${item_id}`);

    con.query(checkItemQuery, [item_id], (err, itemResult) => {
      if (err) {
        console.error("Error checking item existence:", err);
        return callback(err);
      }

      if (itemResult.length === 0) {
        console.log(
          `Deleted rows for item_id ${item_id}. Item does not exist.`
        );
        return callback(null, true);
      } else {
        return callback(null, false);
      }
    });
  });
}

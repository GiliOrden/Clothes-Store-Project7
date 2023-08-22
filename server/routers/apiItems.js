const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");
const config = require("../dbconfig");
const apiFunctions = require("./apiFuncions");
const multer = require("multer");
const path = require("path");

function generateUniqueName() {
  const timestamp = new Date().getTime();
  const randomSuffix = Math.floor(Math.random() * 10000);
  const uniqueName = `${timestamp}_${randomSuffix}`;
  return uniqueName;
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const originalExtension = path.extname(file.originalname);
    const uniqueName = generateUniqueName();
    const newFileName = `${uniqueName}${originalExtension}`;
    cb(null, newFileName);
  },
});
const upload = multer({ storage: storage });

// router.post("/upload", upload.single("img"), (req, res) => {
//   // const name = req.body.name;
//   // const imagePath = req.file.path;

//   // // You can process the received data here, like saving it to a database
//   // console.log(imagePath)
//   console.log("Received body:", req.body);
//   console.log("Received file:", req.file);
//   console.log(req.file.path);

//   res.json({ message: "Image uploaded successfully." });
// });

// router.get("/upload", (req, res) => {
//   const itemDetails = {
//     itemName: "Item Name",
//     // ... other item details
//     // Construct the URL of the image
//     imageUrl: `${req.protocol}://${req.get("host")}/uploads/MemeKing (92).png`,
//   };

//   res.json(itemDetails);
// });

// GET /api/items
// example: http://localhost:3001/api/items
//get all the items in the db

router.get("/", (req, res) => {
  getItems(req)
    .then((results) => {
      if (results.length === 0) {
        return res.status(200).send([]);
      }
      res.status(200).send(results);
    })
    .catch((err) => {
      console.error("Error in request execution", err);
      res.status(500).send({ error: "Error in request execution" });
    });
});

async function getItems(req) {
  const pool = mysql.createPool(config);
  const query = `SELECT * FROM items`;

  try {
    const [results] = await pool.query(query);
    return results;
  } catch (error) {
    throw error;
  }
}
// GET /api/items/type
//http://localhost:3001/items/api/type?type=Skirt
router.get("/type", (req, res) => {
  const itemType = req.query.type;
  getItem(itemType, req)
    .then((results) => {
      if (results.length === 0) {
        return res.status(200).send([]);
      }
      res.status(200).send(results);
    })
    .catch((err) => {
      console.error("Error in request execution", err);
      res.status(500).send({ error: "Error in request execution" });
    });
});

async function getItem(itemType, req) {
  const pool = mysql.createPool(config);
  const query = `SELECT * FROM items WHERE type = ?`;
  try {
    const [results] = await pool.query(query, [itemType]);
    return results.map((item) => ({
      ...item,
      image: `${req.protocol}://${req.get("host")}/${item.image}`,
    }));
  } catch (error) {
    throw error;
  }
}
// GET /api/items/:item_id
//get a specific item according to the id
//http://localhost:3001/api/items/1?username=user1&password=user1pass
router.get("/:item_id", async (req, res) => {
  const itemId = req.params.item_id;
  let username = req.query.username;
  let password = req.query.password;

  const isManager = await apiFunctions.isManager(username, password);
  if (isManager) {
    getItemDetailsForAdmin(itemId, req)
      .then((results) => {
        if (results.length === 0) {
          return res.status(404).send({ error: "Item not found" });
        }
        res.status(200).send(results);
      })
      .catch((err) => {
        console.error("Error in request execution", err);
        res
          .status(500)
          .send({ error: "An error occurred while retrieving user details." });
      });
  } else {
    getItemDetailsForUser(itemId, req)
      .then((results) => {
        if (results.length === 0) {
          return res.status(404).send({ error: "Item not found" });
        }
        res.status(200).send(results);
      })
      .catch((err) => {
        console.error("Error in request execution", err);
        res
          .status(500)
          .send({ error: "An error occurred while retrieving user details." });
      });
  }
});

async function getItemDetailsForUser(itemId, req) {
  const pool = mysql.createPool(config);
  const query = `SELECT 
  items.*,
  COALESCE((SELECT JSON_ARRAYAGG(size) 
             FROM amount 
             WHERE item_id = items.item_id AND amount > 0), JSON_ARRAY()) AS availableSizes,
  COALESCE((SELECT JSON_ARRAYAGG(size) 
             FROM amount 
             WHERE item_id = items.item_id AND amount = 0), JSON_ARRAY()) AS outOfStockSizes
FROM items
WHERE items.item_id = ?;

`;

  try {
    const [results] = await pool.query(query, [itemId]);
    return results.map((item) => ({
      ...item,
      image: `${req.protocol}://${req.get("host")}/${item.image}`,
    }));
  } catch (error) {
    throw error;
  }
}

async function getItemDetailsForAdmin(itemId, req) {
  const pool = mysql.createPool(config);
  const query = `
    SELECT 
      items.*,
      COALESCE(
        JSON_OBJECTAGG(COALESCE(size, ''), COALESCE(amount, '')), 
        JSON_OBJECT()
      ) AS stock
    FROM items
    LEFT JOIN amount ON items.item_id = amount.item_id
    WHERE items.item_id = ?
    GROUP BY items.item_id;
  `;

  try {
    const [results] = await pool.query(query, [itemId]);
    const modifiedResults = results.map((item) => ({
      ...item,
      stock:
        Object.keys(item.stock).length === 1 && item.stock[""] === ""
          ? {}
          : item.stock,
      image: `${req.protocol}://${req.get("host")}/${item.image}`,
    }));
    return modifiedResults;
  } catch (error) {
    throw error;
  }
}

// {
//     "item_description": "Updated Shirt",
//     "type": "Shirt",
//     "image": null
//   }
//PUT http://localhost:3001/items/1
//update item attributes ***** option for a manager****
async function deleteOldAmounts(item_id) {
  try {
    const pool = mysql.createPool(config);

    const deleteCartQuery = "DELETE FROM cart WHERE item_id = ?";
    await pool.query(deleteCartQuery, [item_id]);

    const deleteAmountQuery = "DELETE FROM amount WHERE item_id = ?";
    const [result] = await pool.query(deleteAmountQuery, [item_id]);

    return result;
  } catch (error) {
    throw error;
  }
}

router.put("/:item_id", async (req, res) => {
  const itemId = req.params.item_id;
  const updatedAttributes = req.body;
  const { username, password } = req.query;

  if (
    !itemId ||
    !updatedAttributes ||
    Object.keys(updatedAttributes).length === 0
  ) {
    return res.status(400).send({
      error: "Invalid request. Missing required fields or mismatched item IDs.",
    });
  }

  try {
    const isManager = await apiFunctions.isManager(username, password);
    if (!isManager) {
      return res
        .status(403)
        .send({ error: "The user is not a manager so he can't update items!" });
    }

    const [isValidItem] = await getItemDetailsForAdmin(itemId, req);
    if (!isValidItem) {
      return res.status(404).send({ error: "The item id wasn't found" });
    }

    if (updatedAttributes.stock) {
      // Delete old amounts and then create new amounts
      await deleteOldAmounts(itemId);
      await createAmount(itemId, updatedAttributes.stock);
      delete updatedAttributes.stock;
    } else {
      const updateResult = await updateNewItem(itemId, updatedAttributes);
    }

    res.status(200).send({ result: "Item updated successfully." });
  } catch (err) {
    console.error("An error occurred:", err);
    res
      .status(500)
      .send({ error: "An error occurred while processing the request." });
  }
});

async function updateNewItem(itemId, updatedAttributes) {
  try {
    const pool = mysql.createPool(config);
    const updateQuery = "UPDATE items SET ? WHERE item_id = ?";
    const values = [updatedAttributes, itemId];

    const [result] = await pool.query(updateQuery, values);
    return result;
  } catch (error) {
    throw error;
  }
}

// POST /api/items
//*****  option for the manager ****** */
router.post("/", upload.single("image"), async (req, res) => {
  console.log("req.file:", req.file);
  const newItem = req.body;
  const { item_description, type, price, stock } = newItem;
  const { username, password } = req.query;
  if (!newItem.item_description || !newItem.type) {
    return res
      .status(400)
      .send({ error: "item_description and type are required fields." });
  }

  try {
    const isManager = await apiFunctions.isManager(username, password);
    if (!isManager) {
      return res
        .status(200)
        .send({ error: "The user is not a manager so he can't add items!" });
    }

    const newItemId = await createItem({
      item_description,
      type,
      price,
      //  image: req.file.path,
    });
    await createAmount(newItemId, stock);
    res.status(200).send("The item added successfully!");
  } catch (err) {
    console.error("Error processing item data", err);
    res
      .status(500)
      .send({ error: "An error occurred while processing item data." });
  }
});

async function createItem(newItem) {
  const pool = mysql.createPool(config);
  const query = `INSERT INTO items (item_description, type, image, price, date_add) VALUES (?, ?, ?, ?, ?)`;
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");
  const formattedDate = `${year}-${month}-${day}`;
  const values = [
    newItem.item_description,
    newItem.type,
    newItem.image,
    newItem.price,
    formattedDate,
  ];
  try {
    const [result] = await pool.query(query, values);

    return result.insertId;
  } catch (error) {
    throw error;
  }
}
async function createAmount(newItemId, stock) {
  const pool = mysql.createPool(config);
  const query = `INSERT INTO amount (item_id, size, amount) VALUES (?, ?, ?)`;

  try {
    const promises = Object.entries(stock).map(([size, amount]) => {
      return pool.query(query, [newItemId, size, amount]);
    });

    await Promise.all(promises);

    console.log("Amounts inserted successfully");
  } catch (error) {
    throw error;
  }
}

// DELETE /api/items/:item_id

// Define other routes for items here

module.exports = router;
//####################     items        ##############################

router.delete("/:item_id", async (req, res) => {
  const { username, password } = req.query;
  const item_id = req.params.item_id;
  try {
    const isManager = await apiFunctions.isManager(username, password);
    if (!isManager) {
      return res
        .status(200)
        .send({ error: "The user is not a manager so he can't add items!" });
    }
    await deleteAllSizes(item_id);
    await deleteItem(item_id);
    res.status(202).send("The item deleted successfully!");
    /*
     async (err, sizesDeleted) => {
      if (err) {
        console.error("Error deleting sizes:", err);
        return res
          .status(500)
          .send({ error: "An error occurred while deleting sizes." });
      }

      if (sizesDeleted) {
        await deleteItem(newItem);
        res.status(200).send("The item deleted successfully!");
      }
    }*/
  } catch (err) {
    console.error("Error while deleting item data", err);
    res.status(500).send({ error: "Error while deleting item data." });
  }
});

async function deleteAllSizes(item_id) {
  const pool = mysql.createPool(config);

  const deleteCart = "DELETE FROM cart WHERE item_id = ?";
  const deleteAmount = "DELETE FROM amount WHERE item_id = ?";
  const deleteLiked = "DELETE FROM liked WHERE item_id = ?";
  try {
    const [result] = await pool.query(deleteCart, [item_id]);
    const [result2] = await pool.query(deleteAmount, [item_id]);
    const [result3] = await pool.query(deleteLiked, [item_id]);
  } catch (error) {
    throw error;
  }
}
async function deleteItem(item_id) {
  const pool = mysql.createPool(config);
  const deleteQuery = "DELETE FROM items WHERE item_id = ?";
  try {
    const [result] = await pool.query(deleteQuery, [item_id]);
    if (result.affectedRows === 0) {
      throw new Error("Cart item not found or invalid input provided.");
    }
  } catch (error) {
    throw error;
  }
}

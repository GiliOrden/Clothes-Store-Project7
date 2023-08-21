const mysql = require("mysql2");
const db = require("./dbconfig");

// Make a connection with the database
const connection = mysql.createConnection(db);

// Connect to the MySQL server
connection.connect(async (err) => {
  if (err) {
    console.error("Failed to connect to the MySQL server:", err);
    return;
  }
  console.log("Connected to the MySQL server");

  try {
    // Switch to the database
    await connection.promise().query("USE fullStackProject7");

    // Insert data into the users table
    const usersData = [
      { username: "user1", password: "user1pass", is_admin: false },
      { username: "user2", password: "user2pass", is_admin: true },
      { username: "user3", password: "user3pass", is_admin: false },
      { username: "user4", password: "user4pass", is_admin: false },
      { username: "user5", password: "user5pass", is_admin: false },
      { username: "user6", password: "user6pass", is_admin: false },
      { username: "user7", password: "user7pass", is_admin: false },
      { username: "user8", password: "user8pass", is_admin: false },
    ];
    await connection
      .promise()
      .query("INSERT INTO users (username, password, is_admin) VALUES ?", [
        usersData.map((user) => [user.username, user.password, user.is_admin]),
      ]);

    // Insert data into the items table
    const itemsData = [
      {
        item_description: "Cool Shirt",
        type: "Shirt",
        price: 25.99,
        date_add: "2023-08-19",
        image: "uploads\\1692483326691_1817.png"
      },
      {
        item_description: "Elegant Dress",
        type: "Dress",
        price: 89.99,
        date_add: "2023-08-19",
        image: "uploads\\1692483326691_1817.png"
      },
      {
        item_description: "Casual Skirt",
        type: "Skirt",
        price: 34.99,
        date_add: "2023-08-19",
        image: "uploads\\1692483326691_1817.png"
      },
      {
        item_description: "Sneakers",
        type: "Shoes",
        price: 59.99,
        date_add: "2023-08-19",
        image: "uploads\\1692483326691_1817.png"
      },
      {
        item_description: "Stylish Accessories",
        type: "Accessories",
        price: 12.99,
        date_add: "2023-08-19",
        image: "uploads\\1692483326691_1817.png"
      },
      {
        item_description: "Summer Dress",
        type: "Dress",
        price: 69.99,
        date_add: "2023-08-19",
        image: "uploads\\1692483326691_1817.png"
      },
      {
        item_description: "Formal Shoes",
        type: "Shoes",
        price: 79.99,
        date_add: "2023-08-19",
        image: "uploads\\1692483326691_1817.png"
      },
      {
        item_description: "Fancy Hat",
        type: "Accessories",
        price: 24.99,
        date_add: "2023-08-19",
        image: "uploads\\1692483326691_1817.png"
      },
    ];

    await connection
      .promise()
      .query(
        "INSERT INTO items (item_description, type, price, date_add, image) VALUES ?",
        [
          itemsData.map((item) => [
            item.item_description,
            item.type,
            item.price,
            item.date_add,
            item.image
          ]),
        ]
      );

    // Insert data into the liked table
    const likedData = [
      { item_id: 1, username: "user1" },
      { item_id: 2, username: "user2" },
      { item_id: 3, username: "user1" },
      { item_id: 4, username: "user3" },
      { item_id: 5, username: "user2" },
      { item_id: 6, username: "user4" },
      { item_id: 7, username: "user1" },
      { item_id: 8, username: "user5" },
    ];
    await connection
      .promise()
      .query("INSERT INTO liked (item_id, username) VALUES ?", [
        likedData.map((liked) => [liked.item_id, liked.username]),
      ]);

    // Insert data into the amount table
    const amountData = [
      { item_id: 1, size: "XS", amount: 10 },
      { item_id: 2, size: "S", amount: 8 },
      { item_id: 3, size: "M", amount: 5 },
      { item_id: 4, size: "L", amount: 12 },
      { item_id: 5, size: "M", amount: 3 },
      { item_id: 6, size: "XS", amount: 6 },
      { item_id: 7, size: "L", amount: 10 },
      { item_id: 8, size: "S", amount: 7 },
    ];
    await connection
      .promise()
      .query("INSERT INTO amount (item_id, size, amount) VALUES ?", [
        amountData.map((amount) => [
          amount.item_id,
          amount.size,
          amount.amount,
        ]),
      ]);

    // Insert data into the cart table
    const cartData = [
      { item_id: 1, username: "user1", size: "XS" },
      { item_id: 2, username: "user1", size: "S" },
      { item_id: 3, username: "user2", size: "M" },
      { item_id: 4, username: "user3", size: "L" },
      { item_id: 5, username: "user2", size: "M" },
      { item_id: 6, username: "user4", size: "XS" },
      { item_id: 7, username: "user1", size: "L" },
      { item_id: 8, username: "user5", size: "S" },
    ];
    await connection
      .promise()
      .query("INSERT INTO cart (item_id, username, size) VALUES ?", [
        cartData.map((cart) => [cart.item_id, cart.username, cart.size]),
      ]);

    console.log("Data inserted successfully.");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    // Close the MySQL connection
    connection.end((err) => {
      if (err) {
        console.error("Failed to close the connection:", err);
      }
    });
  }
});

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
      { username: "Harry", password: "Harry1", is_admin: false },
      { username: "Ben", password: "Ben1", is_admin: true },
      { username: "Golyat", password: "Golyat1", is_admin: true },
      { username: "Zvulun", password: "Zvulun1", is_admin: true },
      { username: "Dubi", password: "Dubi1", is_admin: false },
      { username: "Zrubavela", password: "Zrubavela1", is_admin: false },
      { username: "Tamim", password: "Tamim2", is_admin: false },
      { username: "Dardas", password: "Dardas1", is_admin: false },
    ];
    await connection
      .promise()
      .query("INSERT INTO users (username, password, is_admin) VALUES ?", [
        usersData.map((user) => [user.username, user.password, user.is_admin]),
      ]);

    // Insert data into the items table
    const itemsData = [
      {
        item_description: "תיק עור חום",
        type: "accessories",
        price: 25.99,
        date_add: "2023-07-1",
        image: "uploads\\accessories_1.png",
      },
      {
        item_description: " מטריה ידנית סגולה ",
        type: "accessories",
        price: 9.9,
        date_add: "2023-07-2",
        image: "uploads\\accessories_2.png",
      },
      {
        item_description: "עגילי כוכב מכסף",
        type: "accessories",
        price: 99.9,
        date_add: "2023-08-19",
        image: "uploads\\accessories_3.png",
      },
      {
        item_description: "זוג משקפי נשים עם מסגרת מרובעת",
        type: "accessories",
        price: 119.99,
        date_add: "2023-08-14",
        image: "uploads\\accessories_4.png",
      },
      {
        item_description: "בקבוק מים 1 ליטר אדידס",
        type: "Accessories",
        price: 12.99,
        date_add: "2023-08-04",
        image: "uploads\\accessories_5.png",
      },
      {
        item_description: "אוזניות צמר מחממות",
        type: "accessories",
        price: 19.99,
        date_add: "2023-08-01",
        image: "uploads\\accessories_6.png",
      },
      {
        item_description: " 2 זוגות כפפות מחממות שחור ואפור",
        type: "accessories",
        price: 25.99,
        date_add: "2023-08-14",
        image: "uploads\\accessories_7.png",
      },
      {
        item_description: "נרתיק צבעוני לטלפון בתבנית ציורים",
        type: "Accessories",
        price: 39.99,
        date_add: "2023-08-18",
        image: "uploads\\accessories_8.png",
      },
      {
        item_description: "שמלת צמר לבנה בדוגמא מורכבת",
        type: "Dress",
        price: 99.99,
        date_add: "2023-08-15",
        image: "uploads\\dress_1.png",
      },
      {
        item_description: "שמלת ג'נס כחולה במבנה רחב",
        type: "Dress",
        price: 80.99,
        date_add: "2023-08-12",
        image: "uploads\\dress_2.png",
      },
      {
        item_description: "שמלה צהובה פירחונית בדוגמאת סבתא",
        type: "Dress",
        price: 50.99,
        date_add: "2023-08-11",
        image: "uploads\\dress_3.png",
      },
      {
        item_description: "שמלה ירוקה חצי מכופתרת",
        type: "Dress",
        price: 120.99,
        date_add: "2023-08-10",
        image: "uploads\\dress_4.png",
      },
      {
        item_description: "שמלת בורדו קפלים ",
        type: "Dress",
        price: 99.99,
        date_add: "2023-08-15",
        image: "uploads\\dress_5.png",
      },
      {
        item_description: "שמלה כתומה בתבנית חלוק אמבט",
        type: "Dress",
        price: 99.99,
        date_add: "2023-08-15",
        image: "uploads\\dress_6.png",
      },
      {
        item_description: "שמלה מנוקדת שחור לבן סיגנון שנות ה70",
        type: "Dress",
        price: 80.99,
        date_add: "2023-08-15",
        image: "uploads\\dress_7.png",
      },
      {
        item_description: "  שמלת ורוד עתיק בסיגנון חלוק מכופתר  ",
        type: "Dress",
        price: 100.99,
        date_add: "2023-08-09",
        image: "uploads\\dress_8.png",
      },
      {
        item_description: "  ",
        type: "Shirt",
        price: 50.99,
        date_add: "2023-08-09",
        image: "uploads\\shirt_1.png",
      },
      {
        item_description: " סריג פסים כתום ורוד לבן ",
        type: "Shirt",
        price: 50.99,
        date_add: "2023-08-09",
        image: "uploads\\shirt_1.png",
      },
      {
        item_description: " חולצת פריחת הדובדבן ",
        type: "Shirt",
        price: 40.99,
        date_add: "2023-08-22",
        image: "uploads\\shirt_2.png",
      },
      {
        item_description: " סריג אפרפר פסים אלכסון בתוספת פייטים  ",
        type: "Shirt",
        price: 50.99,
        date_add: "2023-08-19",
        image: "uploads\\shirt_3.png",
      },
      {
        item_description: " סריג צמר בצבעי הקשת ",
        type: "Shirt",
        price: 50.99,
        date_add: "2023-08-09",
        image: "uploads\\shirt_4.png",
      },
      {
        item_description: " סריג סיגנון סבא ",
        type: "Shirt",
        price: 40.99,
        date_add: "2023-08-09",
        image: "uploads\\shirt_5.png",
      },
      {
        item_description: " חולצת ג'ינס מכופתרת לבית הספר ",
        type: "Shirt",
        price: 70.99,
        date_add: "2023-08-20",
        image: "uploads\\shirt_6.png",
      },
      {
        item_description: " חולצה פשוטה אפורה זרוקה ",
        type: "Shirt",
        price: 29.99,
        date_add: "2023-08-09",
        image: "uploads\\shirt_7.png",
      },
      {
        item_description: " חולצת זברה פסים שחור לבן ",
        type: "Shirt",
        price: 80.99,
        date_add: "2023-08-21",
        image: "uploads\\shirt_8.png",
      },
      {
        item_description: "חולצת נקודות שחור לבן במבנה רחב  ",
        type: "Shirt",
        price: 50.99,
        date_add: "2023-08-09",
        image: "uploads\\shirt_9.png",
      },
      {
        item_description: " נעלים שחורות נשים שרוכים לבנים ",
        type: "Shoes",
        price: 89.99,
        date_add: "2023-08-09",
        image: "uploads\\shoe_1.png",
      },
      {
        item_description: " מגפוני צמר אפור כהה ",
        type: "Shoes",
        price: 100.99,
        date_add: "2023-08-20",
        image: "uploads\\shoe_2.png",
      },
      {
        item_description: " נעלים לבנות פשוטות ",
        type: "Shoes",
        price: 50.99,
        date_add: "2023-08-21",
        image: "uploads\\shoe_3.png",
      },
      {
        item_description: " נעלים שחורות פלטפורמה לבנה ",
        type: "Shoes",
        price: 100.99,
        date_add: "2023-08-24",
        image: "uploads\\shoe_4.png",
      },
      {
        item_description: " נעלי בית חום צמר ",
        type: "Shoes",
        price: 70.99,
        date_add: "2023-08-25",
        image: "uploads\\shoe_5.png",
      },
      {
        item_description: " נעלי אולסטאר ורודות מבנה קופיקו ",
        type: "Shoes",
        price: 100.99,
        date_add: "2023-08-09",
        image: "uploads\\shoe_6.png",
      },
      {
        item_description: " מגפון חום קטיפתי  ",
        type: "Shoes",
        price: 120.99,
        date_add: "2023-08-25",
        image: "uploads\\shoe_7.png",
      },
      {
        item_description: " מגפון שחור קטיפתי ",
        type: "Shoes",
        price: 120.99,
        date_add: "2023-08-09",
        image: "uploads\\shoe_8.png",
      },
      {
        item_description: " חצאית סקוטית אדומה ",
        type: "Skirt",
        price: 80.99,
        date_add: "2023-08-26",
        image: "uploads\\skirt_1.png",
      },
      {
        item_description: " חצאית ג'ינס קצרה ",
        type: "Skirt",
        price: 99.2,
        date_add: "2023-08-09",
        image: "uploads\\skirt_2.png",
      },
      {
        item_description: " חצאית כתומה פירחונית שכבות  ",
        type: "Skirt",
        price: 100.99,
        date_add: "2023-08-14",
        image: "uploads\\skirt_3.png",
      },
      {
        item_description: " חצאית שחורה לבית הספר ",
        type: "Skirt",
        price: 50.3,
        date_add: "2023-08-20",
        image: "uploads\\skirt_4.png",
      },
      {
        item_description: " חצאית צהובה בסיגנון קצפת ",
        type: "Skirt",
        price: 200.0,
        date_add: "2023-08-22",
        image: "uploads\\skirt_5.png",
      },
      {
        item_description: " חצאית לבנה כפתורים ",
        type: "Skirt",
        price: 100.0,
        date_add: "2023-08-15",
        image: "uploads\\skirt_6.png",
      },
      {
        item_description: " חצאית ורוד נשפך  ",
        type: "Skirt",
        price: 79.99,
        date_add: "2023-08-09",
        image: "uploads\\skirt_7.png",
      },
      {
        item_description: " חצאית סגול קפלים ",
        type: "Skirt",
        price: 99.99,
        date_add: "2023-08-09",
        image: "uploads\\skirt_8.png",
      },
      {
        item_description: " חצאית ורוד ברבי עם נצנצים ",
        type: "Skirt",
        price: 119.99,
        date_add: "2023-08-26",
        image: "uploads\\skirt_9.png",
      },
      {
        item_description: " חצאית משובצת מגבת מטבח ",
        type: "Skirt",
        price: 40.99,
        date_add: "2023-08-19",
        image: "uploads\\skirt_11.png",
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
            item.image,
          ]),
        ]
      );

    // Insert data into the liked table
    const likedData = [
      { item_id: 1, username: "Golyat" },
      { item_id: 2, username: "Golyat" },
      { item_id: 3, username: "Zrubavela" },
      { item_id: 4, username: "Dubi" },
      { item_id: 5, username: "Dubi" },
      { item_id: 6, username: "Dardas" },
      { item_id: 7, username: "Dardas" },
      { item_id: 8, username: "Dardas" },
    ];
    await connection
      .promise()
      .query("INSERT INTO liked (item_id, username) VALUES ?", [
        likedData.map((liked) => [liked.item_id, liked.username]),
      ]);

    // Insert data into the amount table
    const amountData = [
      { item_id: 1, size: "XS", amount: 10 },
      { item_id: 1, size: "S", amount: 10 },
      { item_id: 1, size: "M", amount: 10 },
      { item_id: 1, size: "L", amount: 10 },
      { item_id: 9, size: "XS", amount: 10 },
      { item_id: 9, size: "S", amount: 10 },
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
      { item_id: 1, username: "Dardas", size: "XS" },
      { item_id: 2, username: "Dardas", size: "S" },
      { item_id: 3, username: "Dardas", size: "M" },
      { item_id: 4, username: "Zrubavela", size: "L" },
      { item_id: 5, username: "Zrubavela", size: "M" },
      { item_id: 6, username: "Dubi", size: "XS" },
      { item_id: 7, username: "Dubi", size: "L" },
      { item_id: 8, username: "Dubi", size: "S" },
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

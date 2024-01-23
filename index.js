import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "permalist",
  password: "3754",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [];

//asinhrona funkcija za iscitavanje iz baze (vazno je i u app.get navestu da je async)
async function listOfItems() {
  try {
    const result = await db.query("SELECT * FROM items ORDER BY id ASC");
    return result.rows;
  } catch (error) {
    console.error("Error fetching data from database:", error);
    throw error; // hvatanje greske
  }
}

//obavezno navesti async zbog funkcije
app.get("/", async (req, res) => {
  try {
    const items = await listOfItems();

    res.render("index.ejs", {
      listTitle: "Today",
      listItems: items,
    });
  } catch (error) {
    console.error("Error handling data:", error);
    res.status(500).send("Internal Server Error");
  }
});

//funkcija za dodavanje novog itema
async function addItem(newItem) {
  try {
    await db.query("INSERT INTO items (title) VALUES ($1)", [newItem]);
  } catch (error) {
    console.error("Error inserting data into database:", error);
    throw error;
  }
}
//uzima unesene podatke i ubacuje ih u tabelu pomocu funkcije
app.post("/add", async (req, res) => {
  const newItem = req.body.newItem;

  try {
    await addItem(newItem);
    res.redirect("/");
  } catch (error) {
    console.error("Error adding item:", error);
    res.status(500).send("Internal Server Error");
  }
});
//funkcija za azuriranje podataka u tabeli
async function updateItem(updatedItemId, updatedItemTitle) {
  try {
    await db.query("UPDATE items SET title = $1 WHERE id = $2", [
      updatedItemTitle,
      updatedItemId,
    ]);
  } catch (error) {
    console.error("Error updating data in the database:", error);
    throw error;
  }
}

app.post("/edit", async (req, res) => {
  const updatedItemId = req.body.updatedItemId;
  const updatedItemTitle = req.body.updatedItemTitle;

  try {
    await updateItem(updatedItemId, updatedItemTitle);
    res.redirect("/");
  } catch (error) {
    console.error("Error updating item:", error);
    res.status(500).send("Internal Server Error");
  }
});
//funkcija za brisanje iz tabele
async function deleteItem(deleteItemId) {
  try {
    await db.query("DELETE FROM items WHERE id = $1", [deleteItemId]);
  } catch (error) {
    console.error("Error deleting data from the database:", error);
    throw error;
  }
}

app.post("/delete", async (req, res) => {
  const deleteItemId = req.body.deleteItemId;

  try {
    await deleteItem(deleteItemId);
    res.redirect("/");
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

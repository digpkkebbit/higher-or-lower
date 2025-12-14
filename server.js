import 'dotenv/config';
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { fetchGEDump } from './fetch-wiki.js';

const app = express();
const PORT = 3000;

// Fix for ES modules to get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

// Items Cache
let items = null;

const updateItems = async () => {
  try {
    const data = await fetchGEDump();
    items = data;
  } catch (e) {
    console.error("Failed to update items:", e)
  }
}

// Update items cache on server start
await updateItems();

// Refetch items every hour
setInterval(updateItems, 60 * 60 * 1000);


// --- API ---

// Get all items
app.get("/api/items", (req, res) => {
  res.json(items);
});

// Get random item
app.get("/api/randomItem", (req, res) => {
  const keys = Object.keys(items).filter(k => !k.startsWith("%"));
  const randomKey = keys[Math.floor(Math.random() * keys.length)];

  // Deconstruct item to remove unused properties
  const { id, name, price } = items[randomKey];
  let item = { id, name, price };

  res.json(item);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
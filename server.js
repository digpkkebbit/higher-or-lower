import 'dotenv/config';
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { fetchGEDump, fetchGEMapping } from './fetch-wiki.js';

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
    const [data, mappingData] = await Promise.all([fetchGEDump(), fetchGEMapping()]);

    if (!data?.data || !mappingData) {
      console.warn("Wiki fetch failed, no data received");
      return;
    }

    // Filter the mapping data to remove unavailable items
    const filteredItems = Object.fromEntries(
      Object.entries(mappingData).filter(([id]) => id in data.data)
    );

    // Update cache
    if (Object.keys(filteredItems).length > 0) {
      items = filteredItems;
    }

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
// app.get("/api/items", (req, res) => {
//   res.json(items);
// });

// Get a random item's id, name and price
app.get("/api/randomItem", (req, res) => {
  if (!items) {
    return res.status(503).json({ error: "Data not loaded yet" });
  }

  // Get a random item
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
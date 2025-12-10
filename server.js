import 'dotenv/config';
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = 3000;

// Fix for ES modules to get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

// Fetch GE dump from osrs wiki api
const url = "https://chisel.weirdgloop.org/gazproj/gazbot/os_dump.json";

let items = null
let lastUpdate = null

async function fetchDump() {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": `higher-or-lower/${process.env.ENVIRONMENT} (${process.env.CONTACT_EMAIL})`
      }
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const text = await res.text();

    if (!text) throw new Error("Empty response body");

    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error("JSON parse failed — response was incomplete:", text.slice(0, 200) + "...");
      throw new Error("Invalid JSON received");
    }

    // Everything valid → update in-memory dataset
    items = data;
    lastUpdate = data["%JAGEX_TIMESTAMP%"] || Date.now();
    console.log("Dump updated at:", lastUpdate);

  } catch (err) {
    console.error("Error fetching dump:", err);
  }
}

// Fetch on server start
await fetchDump();
// Then refetch every 10mins
setInterval(fetchDump, 10 * 60 * 1000);


// --- API ---

// Get all items
app.get("/api/items", (req, res) => {
  res.json(items);
});

// Get random item
app.get("/api/randomItem", (req, res) => {
  const keys = Object.keys(items).filter(k => !k.startsWith("%"));
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  console.log(randomKey);
  console.log(items[randomKey])
  res.json(items[randomKey]);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
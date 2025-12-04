const express = require("express");
const mongoose = require("mongoose");

const app = express();
const port = 3001;

app.use(express.json());

// Log requests
app.use((req, res, next) => {
  console.log("👉 Incoming request:", req.method, req.url);
  next();
});

console.log("🔥 Server file started running...");

// --------------------
// FIX: Use env variable or fallback
// --------------------
const MONGO_URI = "mongodb://mongo:27017/User";

console.log("📌 Connecting to Mongo at:", MONGO_URI);

// --------------------
// FIX: Proper Mongoose connection
// --------------------
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ Mongo Error:", err));

// --------------------
// User Model
// --------------------
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
});

const User = mongoose.model("User", userSchema);

// --------------------
// Routes
// --------------------

// POST /users
app.post("/users", async (req, res) => {
  console.log("➡️ POST /users hit");
  console.log("➡️ Body:", req.body);

  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    console.error("❌ Save Error:", err);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// GET /users/:id
app.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// GET /users (FIXED)
app.get("/users", async (req, res) => {
  try {
    const users = await User.find(); // fixed
    res.json(users);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// --------------------
// FIX: Listen on 0.0.0.0 (required for Docker)
// --------------------
app.listen(port, "0.0.0.0", (err) => {
  if (err) {
    console.error("❌ Server failed to start:", err);
    return;
  }
  console.log("🚀 Server running on port", port);
});

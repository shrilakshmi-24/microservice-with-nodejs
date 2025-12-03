const express = require("express");
const mongoose = require("mongoose");

const app = express();
const port = 3001;

app.use(express.json());

app.use((req, res, next) => {
  console.log("👉 Incoming request:", req.method, req.url);
  next();
});
console.log("🔥 Server file started running...");


mongoose
  .connect("mongodb://127.0.0.1:27017/user")
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("Mongo Error:", err));

// const User = mongoose.model(
//   "User",ß
//   new mongoose.Schema({
//     name: String,
//     email: String,
//   })
// );
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
});

const User = mongoose.model("User", userSchema);

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

app.get("/users/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
    }
    catch (err) {
        console.error("❌ Fetch Error:", err);
        res.status(500).json({ error: "Failed to fetch user" });
    }
}
);

app.get("/users", async (req, res) => {
    try {
        const users = await User.find(req.params.id);
        if (!users) {
            return res.status(404).json({ error: "Users not found" });
        }
        res.json(users);
    }
    catch (err) {
        console.error("❌ Fetch Error:", err);
        res.status(500).json({ error: "Failed to fetch user" });
    }
}
);

app.listen(port, "127.0.0.1", (err) => {
  if (err) {
    console.error("❌ Server failed to start:", err);
    return;
  }
  console.log("🚀 Server running at http://127.0.0.1:" + port);
});

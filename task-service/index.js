const express = require("express");
const mongoose = require("mongoose");
const amqp = require("amqplib");

const app = express();
const port = 3002;

app.use(express.json());

app.use((req, res, next) => {
  console.log("👉 Incoming request:", req.method, req.url);
  next();
});
console.log("🔥 Server file started running...");


mongoose
  .connect("mongodb://mongo:27017/Task")
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("Mongo Error:", err));

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    userId:{type: String},
    createdAt: { type: Date, default: Date.now },
});

const Task = mongoose.model("Task", taskSchema);

app.post("/task", async (req, res) => {

  try {
    const task = new Task(req.body);
    await task.save();
    if(!channel){

        return res.status(500).json({ error: "No channel found" });
    }
    channel.sendToQueue(
        "task_created",
        Buffer.from(
          JSON.stringify({
            id: task._id,
            title: task.title,
            userId: task.userId,
          })
        )
      );
    res.status(201).json(task);
  } catch (err) {
    console.error("❌ Save Error:", err);
    res.status(500).json({ error: "Failed to create task" });
  }
});

app.get("/task/:id", async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ error: "task not found" });
        }
        res.json(task);
    }
    catch (err) {
        console.error("❌ Fetch Error:", err);
        res.status(500).json({ error: "Failed to fetch task" });
    }
}
);

app.get("/task", async (req, res) => {
    try {
        const tasks = await Task.find(req.params.id);
        if (!tasks) {
            return res.status(404).json({ error: "tasks not found" });
        }
        res.json(tasks);
    }
    catch (err) {
        console.error("❌ Fetch Error:", err);
        res.status(500).json({ error: "Failed to fetch task" });
    }
}
);

let connection, channel;

async function connectRabbitMqWithRetry(retry = 5, delay=3000) {
  while (retry) {
    try {
      connection = await amqp.connect("amqp://rabbitmq");
      channel = await connection.createChannel();
      await channel.assertQueue("task_created");
      console.log("✅ Connected to RabbitMQ");
      return;
    }
    catch (err) {
      console.error("❌ RabbitMQ Connection Error:", err);
      retry--;
      console.log(`🔄 Retrying... Attempts left: ${retry}`);
      await new Promise(res => setTimeout(res, delay)); 
    }
  }
  
}
try {
  app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    connectRabbitMqWithRetry();
  });
} catch (err) {
  console.error("❌ Server failed to start:", err);
}

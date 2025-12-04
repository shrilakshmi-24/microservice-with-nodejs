const amqp = require("amqplib");
let channel, connection;

async function startQueue() {
  try {
    connection = await amqp.connect("amqp://rabbitmq");
    channel = await connection.createChannel();

    await channel.assertQueue("task_created");
    console.log("✅ Connected to RabbitMQ and queue asserted");

    channel.consume("task_created", msg => {
      try {
        const data = JSON.parse(msg.content.toString());
        console.log("📧 Sending notification message to:", data.userId);

        // Always ack the original msg
        channel.ack(msg);
      } catch (err) {
        console.error("❌ Error processing message:", err);
        // Optionally: channel.nack(msg, false, true); // requeue
      }
    });

  } catch (err) {
    console.error("❌ RabbitMQ Connection Error:", err);
  }
}

startQueue();

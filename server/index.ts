import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { Redis } from "ioredis";
import "dotenv/config";

const app = express();
app.use(cors());

const redis = new Redis(process.env.REDIS_CONNECTION_STRING);
const sunRedis = new Redis(process.env.REDIS_CONNECTION_STRING);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

sunRedis.on("message", async (room, message) => {
  io.to(room).emit("room-update", message);
});

sunRedis.on("error", (err) => {
  console.error("Redis error", err);
});

io.on("connection", async (socket) => {
  const { id } = socket;
  socket.on("join-room", async (room) => {
    console.log(`User ${id} joined room ${room}`);

    const subscribedRooms = await redis.smembers("subscribed-rooms");
    await socket.join(room);
    await redis.sadd(`rooms:${id}`, room);
    await redis.hincrby("room-connections", room, 1);
    if (!subscribedRooms.includes(room)) {
      sunRedis.subscribe(room, async (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log(`Subscribed to ${room}`);
          await redis.sadd("subscribed-rooms", room);
        }
      });
    }
  });
  socket.on("disconnect", async () => {
    const { id } = socket;

    const joinedRooms = await redis.smembers(`rooms:${id}`);
    await redis.del(`rooms:${id}`);

    joinedRooms.forEach(async (room) => {
      const remainingConnections = await redis.hincrby(
        `room-connections`,
        room,
        -1
      );

      if (remainingConnections <= 0) {
        await redis.hdel(`room-connections`, room);

        sunRedis.unsubscribe(room, async (err) => {
          if (err) {
            console.error("Failed to unsubscribe", err);
          } else {
            await redis.srem("subscribed-rooms", room);

            console.log("Unsubscribed from room:", room);
          }
        });
      }
    });
  });
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

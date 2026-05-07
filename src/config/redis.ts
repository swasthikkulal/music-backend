import Redis from "ioredis";
import { env } from "./env";
const redis = new Redis(env.REDIS_URL);

redis.on("connect", () => {
  console.log("redis connected");
});

redis.on("error", (err) => {
  console.error("redis error:", err);
});

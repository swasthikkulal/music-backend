import { Queue } from "bullmq";
import redis from "../config/redis";

export const playCountQueue = new Queue("playCount", {
  connection: redis,
});

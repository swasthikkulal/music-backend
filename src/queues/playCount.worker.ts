import { Worker } from "bullmq";
import redis from "../config/redis";
import prisma from "../config/db";
import logger from "../utils/logger";

const worker = new Worker(
  "playCount",
  async (job) => {
    const { songId } = job.data;

    await prisma.song.update({
      where: { id: songId },
      data: { playCount: { increment: 1 } },
    });

    logger.info(`Play count incremented for song: ${songId}`);
  },
  { connection: redis },
);

worker.on("failed", (job, err) => {
  logger.error(
    `Play count job failed for ${job?.data?.songId}: ${err.message}`,
  );
});

export default worker;

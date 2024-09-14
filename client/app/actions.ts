"use server";

import { redis } from "@/lib/redis";
import { revalidatePath } from "next/cache";

export const createTopic = async ({
  topicName,
  userId,
}: {
  topicName: string;
  userId: string;
}) => {
  const regex = /^[a-zA-Z-]+$/;

  if (!topicName || topicName.length > 50) {
    return { error: "Name must be between 1 and 50 chars" };
  }

  if (!regex.test(topicName)) {
    return { error: "Only letters and hyphens allowed in name" };
  }

  // Check if the topic already exists
  const topicExists = await redis.sismember("existing-topics", topicName);

  let role;
  if (!topicExists) {
    // Topic does not exist, assign the creator as admin
    role = "admin";

    // Store the new topic and the admin user ID
    await redis.sadd("existing-topics", topicName);
    await redis.hset("topicAdmins", { [topicName]: userId }); // Store admin user ID in hash map
  } else {
    // Topic exists, assign role as user
    role = "user";
  }

  // Store topic creator ID, regardless of role
  await redis.set(`topic:${topicName}:creator`, userId);

  // Return the role
  revalidatePath(`/`);
  return { role: role };
};

//  hello -> 1
//  world -> 2
function wordFreq(text: string): { text: string; value: number }[] {
  const words: string[] = text.replace(/\./g, "").split(/\s/);
  const freqMap: Record<string, number> = {};

  for (const w of words) {
    if (!freqMap[w]) freqMap[w] = 0;
    freqMap[w] += 1;
  }
  return Object.keys(freqMap).map((word) => ({
    text: word,
    value: freqMap[word],
  }));
}

export const submitComment = async ({
  comment,
  topicName,
}: {
  comment: string;
  topicName: string;
}) => {
  const words = wordFreq(comment);

  await Promise.all(
    words.map(async (word) => {
      await redis.zadd(
        `room:${topicName}`,
        { incr: true },
        { member: word.text, score: word.value }
      );
    })
  );

  await redis.incr("served-requests");

  await redis.publish(`room:${topicName}`, words);

  return comment;
};

import { RedisClient } from "bun";
import env from "./env";

const redis = new RedisClient(env.REDIS_URL);

export default redis;

import { DeepgramClient } from "@deepgram/sdk";
import { env } from "../config/env.js";

const dg = new DeepgramClient(env.DEEPGRAM_API_KEY);

console.log("DG INSTANCE:");
console.dir(dg, { depth: 3 });
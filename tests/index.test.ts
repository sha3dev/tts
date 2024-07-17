/**
 * imports: externals
 */

import * as fs from "fs";
import * as assert from "node:assert";
import { test } from "node:test";
import TTS, {
  ElevenlabsProvider,
  GoogleTTSProvider,
  PollyProvider,
} from "../dist/index";

/**
 * env init
 */

require("dotenv").config({ path: [".env", "../.env"] });

/**
 * consts
 */

const SAMPLE_TEXT = "Ey!";

const SAMPLE_SOUND_PROMPT = "A barking dog";

/**
 * tests
 */

const elevenlabs = new ElevenlabsProvider({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

const googleTTS = new GoogleTTSProvider({
  languageCode: "es-ES",
  googleProjectId: process.env.GOOGLE_PROJECT_ID,
  googleClientEmail: process.env.GOOGLE_CLIENT_EMAIL,
  googlePrivateKey: process.env.GOOGLE_PRIVATE_KEY.split(String.raw`\n`).join(
    "\n"
  ),
});

const polly = new PollyProvider({
  languageCode: "es-ES",
  awsRegion: "eu-west-1",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const tts = new TTS({
  providers: [elevenlabs, googleTTS, polly],
});

test("Generate speech using Elevenlabs", async () => {
  const speech = await tts.generateSpeech({
    provider: elevenlabs.Name,
    text: SAMPLE_TEXT,
    voiceId: "9F4C8ztpNUmXkdDDbz3J",
  });
  const stat = fs.statSync(speech.filePath);
  assert.ok(stat.size > 0);
});

test("Generate speech using Google Text-to-Speech", async () => {
  const speech = await tts.generateSpeech({
    provider: googleTTS.Name,
    text: SAMPLE_TEXT,
    voiceId: "es-ES-Wavenet-B",
  });
  const stat = fs.statSync(speech.filePath);
  assert.ok(stat.size > 0);
});

test("Generate speech using AWS Polly", async () => {
  const speech = await tts.generateSpeech({
    provider: polly.Name,
    text: SAMPLE_TEXT,
    voiceId: "Sergio",
  });
  const stat = fs.statSync(speech.filePath);
  assert.ok(stat.size > 0);
});

test("Generate sound using elevenlabs", async () => {
  const sound = await elevenlabs.generateSound(SAMPLE_SOUND_PROMPT, {
    duration: 1,
  });
  const stat = fs.statSync(sound.filePath);
  assert.ok(stat.size > 0);
});

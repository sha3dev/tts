export default {
  // elevenlabs
  ELEVENLABS_TTS_API_URL:
    process.env.ELEVENLABS_TTS_API_URL ||
    "https://api.elevenlabs.io/v1/text-to-speech",
  ELEVENLABS_SOUND_API_URL:
    process.env.ELEVENLABS_SOUND_API_URL ||
    "https://api.elevenlabs.io/v1/sound-generation",
  ELEVENLABS_MAX_SOUND_DURATION: Number(
    process.env.ELEVENLABS_MAX_SOUND_DURATION || 4
  ),
  ELEVENLABS_DEFAULT_MODEL_ID:
    process.env.ELEVENLABS_DEFAULT_MODEL_ID || "eleven_multilingual_v2",
  // polly
  POLLY_DEFAULT_ENGINE: process.env.POLLY_DEFAULT_ENGINE || "neural",
};

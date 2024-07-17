/**
 * imports: externals
 */

import * as fs from "node:fs";

/**
 * imports: internals
 */

import config from "../../config";
import Provider, { GenerateSpeechOptions } from "../abstract/provider";

/**
 * types
 */

export type ElevenlabsProviderOptions = { apiKey: string; modelId?: string };

export type ElevenlabsGenerateSoundOptions = { duration?: number };

/**
 * export
 */

export default class Elevenlabs extends Provider {
  /**
   * private: properties
   */

  /**
   * constructor
   */

  constructor(private options: ElevenlabsProviderOptions) {
    super("elevenlabs");
  }

  /**
   * private : methods
   */

  private async saveStreamToFile(stream: ReadableStream): Promise<string> {
    const filePath = this.getTempFilepath("elevenlabs");
    const fileStream = fs.createWriteStream(filePath);
    const reader = stream.getReader();
    try {
      let done: boolean | undefined;
      let value: Uint8Array | undefined;
      while (!done) {
        ({ done, value } = await reader.read());
        if (value) fileStream.write(value);
      }
    } finally {
      fileStream.end();
    }
    return new Promise((resolve, reject) => {
      fileStream.on("finish", () => resolve(filePath));
      fileStream.on("error", reject);
    });
  }

  /**
   * public : methods
   */

  public async generateSpeech(text: string, options: GenerateSpeechOptions) {
    const { apiKey, modelId } = this.options;
    const { voiceId, previousText, nextText } = options;
    const response = await fetch(
      `${config.ELEVENLABS_TTS_API_URL}/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: modelId || config.ELEVENLABS_DEFAULT_MODEL_ID,
          previous_text: previousText,
          next_text: nextText,
        }),
      }
    );
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Error generating elevenlabs speech (${response.statusText}): ${errorText}`
      );
    }
    const audioId = response.headers.get("request-id");
    if (!audioId) {
      throw new Error(`request id not found on elevenlabs response`);
    }
    const stream = response.body;
    const filePath = await this.saveStreamToFile(stream!);
    return { filePath };
  }

  public async generateSound(
    prompt: string,
    options?: ElevenlabsGenerateSoundOptions
  ) {
    const { apiKey } = this.options;
    const { duration } = options;
    if (duration && duration > config.ELEVENLABS_MAX_SOUND_DURATION) {
      throw new Error(
        `Error generating elevenlabs sound: max value for duration is ${config.ELEVENLABS_MAX_SOUND_DURATION}`
      );
    }
    const response = await fetch(`${config.ELEVENLABS_SOUND_API_URL}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: prompt,
        duration_seconds: Math.min(
          duration,
          config.ELEVENLABS_MAX_SOUND_DURATION
        ),
        prompt_influence: 0.3,
      }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Error generating elevenlabs sound (${response.statusText}): ${errorText}`
      );
    }
    const stream = response.body;
    const filePath = await this.saveStreamToFile(stream!);
    return { filePath };
  }
}

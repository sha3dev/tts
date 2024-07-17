/**
 * imports: externals
 */

import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import * as util from "node:util";
import * as fs from "fs";

/**
 * imports: internals
 */

import Provider, { GenerateSpeechOptions } from "../abstract/provider";

/**
 * types
 */

export type GoogleTTSProviderOptions = {
  googleProjectId: string;
  googleClientEmail: string;
  googlePrivateKey: string;
  languageCode: string;
  format?: "text" | "ssml";
};

/**
 * consts
 */

/**
 * export
 */

export default class GoogleTTS extends Provider {
  /**
   * private: attributes
   */

  private client: TextToSpeechClient;

  /**
   * constructor
   */

  constructor(private options: GoogleTTSProviderOptions) {
    super("google-tts");
    const { googleProjectId, googleClientEmail, googlePrivateKey } = options;
    this.client = new TextToSpeechClient({
      projectId: googleProjectId,
      credentials: {
        client_email: googleClientEmail,
        private_key: googlePrivateKey,
      },
    });
  }

  /**
   * public : methods
   */

  public async generateSpeech(text: string, options: GenerateSpeechOptions) {
    const { format, languageCode } = this.options;
    const { voiceId } = options;
    const request = {
      input: format === "text" ? { text } : { ssml: text },
      audioConfig: { audioEncoding: "MP3" as const },
      voice: { name: voiceId, languageCode },
    };
    const filePath = this.getTempFilepath("google-tts");
    const [response] = await this.client.synthesizeSpeech(request);
    const writeFile = util.promisify(fs.writeFile);
    await writeFile(filePath, response.audioContent, "binary");
    return { filePath };
  }
}

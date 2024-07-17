/**
 * imports: externals
 */

import * as AWS from "aws-sdk";
import * as fs from "fs";

/**
 * imports: internals
 */

import config from "../../config";
import Provider, { GenerateSpeechOptions } from "../abstract/provider";

/**
 * types
 */

export type PollyProviderOptions = {
  accessKeyId: string;
  secretAccessKey: string;
  awsRegion: string;
  languageCode: string;
  format?: "text" | "ssml";
};

/**
 * export
 */

export default class Polly extends Provider {
  /**
   * private: attributes
   */

  private client: AWS.Polly;

  /**
   * constructor
   */

  constructor(private options: PollyProviderOptions) {
    super("polly");
    const { accessKeyId, secretAccessKey, awsRegion } = options;
    this.client = new AWS.Polly({
      credentials: { accessKeyId, secretAccessKey },
      region: awsRegion,
    });
  }

  /**
   * public : methods
   */

  public async generateSpeech(text: string, options: GenerateSpeechOptions) {
    const { format, languageCode } = this.options;
    const { voiceId } = options;
    const params: AWS.Polly.SynthesizeSpeechInput = {
      Text: text,
      TextType: format === "ssml" ? "ssml" : undefined,
      OutputFormat: "mp3",
      VoiceId: voiceId,
      LanguageCode: languageCode,
      Engine: config.POLLY_DEFAULT_ENGINE,
    };
    const filePath = this.getTempFilepath();
    const data = await this.client.synthesizeSpeech(params).promise();
    if (!(data.AudioStream instanceof Buffer)) {
      throw new Error(
        `Error generating polly speech: Invalid AudioStream format`
      );
    }
    fs.writeFileSync(filePath, data.AudioStream);
    return { filePath };
  }
}

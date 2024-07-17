/**
 * imports: externals
 */

import * as os from "os";
import * as path from "path";

/**
 * types
 */

export type GenerateSpeechOptions = {
  voiceId?: string;
  previousText?: string;
  nextText?: string;
};

export type GenerateSpeechResult = { filePath: string };

/**
 * consts
 */

/**
 * export
 */

export default abstract class Provider {
  /**
   * private: properties
   */

  /**
   * public: properties
   */

  public get Name() {
    return this.name;
  }

  /**
   * constructor
   */

  constructor(private name: string) {}

  /**
   * private : methods
   */

  /**
   * protected : methods
   */

  protected getTempFilepath(prefix = "tmp-", postfix = ".mp3") {
    const tempDir = os.tmpdir();
    const uniqueId =
      Date.now().toString(36) + Math.random().toString(36).slice(2);
    const tempFileName = `${prefix}${uniqueId}${postfix}`;
    return path.join(tempDir, tempFileName);
  }

  /**
   * public : methods
   */

  public abstract generateSpeech(
    text: string,
    options: GenerateSpeechOptions
  ): Promise<GenerateSpeechResult>;
}

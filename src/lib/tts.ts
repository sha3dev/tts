/**
 * imports: externals
 */

import Logger from "@sha3/logger";

/**
 * imports: internals
 */

import Provider from "./abstract/provider";

/**
 * module: initializations
 */

const logger = new Logger("tts");

/**
 * types
 */

export type TTSItem = { provider: string; text: string; voiceId: string };

/**
 * consts
 */

/**
 * types
 */

/**
 * export
 */

export default class TTS {
  /**
   * private: properties
   */

  private providers: Provider[];

  /**
   * constructor
   */

  constructor(options: { providers?: Provider[] }) {
    this.providers = options?.providers || [];
  }

  /**
   * public : methods
   */

  public addProvider(provider: Provider) {
    logger.debug(`adding provider: ${provider.Name}`);
    this.providers = [
      ...this.providers.filter((i) => i.Name === provider.Name),
      provider,
    ];
  }

  public async generateSpeech(item: TTSItem | TTSItem[]) {
    const items = Array.isArray(item) ? item : [item];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const provider = this.providers.find((i) => i.Name === item.provider);
      if (!provider) {
        const errMesg = `tts provider not found: ${item.provider}`;
        logger.error(errMesg);
        throw new Error(errMesg);
      }
      try {
        logger.debug(
          `generating speech (${provider.Name}): ${item.text.length} characters`
        );
        const filePath = await provider.generateSpeech(item.text, {
          previousText: items[i - 1]?.text,
          nextText: items[i + 1]?.text,
          voiceId: item.voiceId,
        });
        return filePath;
      } catch (e: any) {
        logger.error(`error generating speech on ${provider}: ${e.message}`);
        throw e;
      }
    }
  }
}

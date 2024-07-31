import { DecompressionStream } from 'node:stream/web';
import { pipeline } from 'node:stream/promises';
import { Writable } from 'node:stream';
import { AuthenticatedApp } from './authenticated-app';
import Token from './token';

export class ZoneFile extends AuthenticatedApp {
  constructor(
    token: Token,
    userAgent: string,
    readonly url: string,
  ) {
    super(token, userAgent);
  }

  async getRawStream() {
    const response = await this.fetch(this.url);
    if (!response.body) {
      throw new Error('Response body is not available');
    }
    return response.body;
  }

  async getTextStream() {
    const gzStream = await this.getRawStream();

    return gzStream.pipeThrough(new DecompressionStream('gzip'));
  }

  async getText() {
    const textStream = await this.getTextStream();
    let fullText = '';

    await pipeline(
      textStream,
      new Writable({
        objectMode: true,
        autoDestroy: true,
        async write(chunk, encoding, callback) {
          fullText += Buffer.from(chunk).toString(encoding);
          callback();
        },
      }),
    );

    return fullText;
  }
}

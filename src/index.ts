import { DecompressionStream } from 'node:stream/web';
import { pipeline } from 'node:stream/promises';
import { Writable } from 'node:stream';

export interface IcannCredentials {
  username: string;
  password: string;
}

export interface CzdsClientOptions {
  credentials: IcannCredentials;
  userAgent: string;
}

const BASE_URL = 'https://czds-api.icann.org';

const tryFetch = async (url: string, opts: RequestInit) => {
  const response = await fetch(url, opts);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }
  return response;
};

export interface CzdsLink {
  url: string;
}

abstract class AuthenticatedApp {
  protected constructor(
    protected readonly token: string,
    protected readonly userAgent: string,
  ) {}

  protected fetch(url: string) {
    return tryFetch(url, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        'User-Agent': this.userAgent,
      },
    });
  }
}

class Zone extends AuthenticatedApp {
  constructor(
    token: string,
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

/**
 * A client for the Centralized Zone Data Service (CZDS) API.
 */
export default class CzdsClient extends AuthenticatedApp {
  static async authenticate(opts: CzdsClientOptions): Promise<CzdsClient> {
    const response = await tryFetch(
      'https://account-api.icann.org/api/authenticate',
      {
        method: 'POST',
        body: JSON.stringify(opts.credentials),
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
    );

    const body = (await response.json()) as { accessToken: string };

    return new CzdsClient(body.accessToken, opts.userAgent);
  }

  protected constructor(token: string, userAgent: string) {
    super(token, userAgent);
  }

  async listZoneDownloadLinks() {
    const response = await this.fetch(`${BASE_URL}/czds/downloads/links`);
    const links = (await response.json()) as string[];
    return links.map((link) => new Zone(this.token, this.userAgent, link));
  }

  getZone(zone: string) {
    return new Zone(
      this.token,
      this.userAgent,
      `https://czds-download-api.icann.org/czds/downloads/${zone}.zone`,
    );
  }
}

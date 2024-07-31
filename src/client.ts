import { IcannCredentials } from './icann-credentials';
import Token from './token';
import { AuthenticatedApp } from './authenticated-app';
import { ZoneFile as ZoneFile } from './zone-file';

export interface CzdsClientOptions {
  credentials: IcannCredentials;
  userAgent: string;
}

const BASE_URL = 'https://czds-api.icann.org';

export interface CzdsLink {
  url: string;
}

/**
 * A client for the Centralized Zone Data Service (CZDS) API.
 */
export default class CzdsClient extends AuthenticatedApp {
  static async authenticate(opts: CzdsClientOptions): Promise<CzdsClient> {
    const token = new Token(opts.credentials);
    token.fetch();

    return new CzdsClient(token, opts.userAgent);
  }

  protected constructor(token: Token, userAgent: string) {
    super(token, userAgent);
  }

  async listZoneDownloadLinks() {
    const response = await this.fetch(`${BASE_URL}/czds/downloads/links`);
    const links = (await response.json()) as string[];
    return links.map((link) => new ZoneFile(this.token, this.userAgent, link));
  }

  getZone(zone: string) {
    return new ZoneFile(
      this.token,
      this.userAgent,
      `https://czds-download-api.icann.org/czds/downloads/${zone}.zone`,
    );
  }
}

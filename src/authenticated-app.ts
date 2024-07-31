import { CzdsClientError } from './czds-client-error';
import Token from './token';
import tryFetch from './try-fetch';

export abstract class AuthenticatedApp {
  protected constructor(
    protected readonly token: Token,
    protected readonly userAgent: string,
  ) {}

  #authenticatedFetch(url: string) {
    return tryFetch(url, {
      headers: {
        Authorization: this.token.bearer,
        'User-Agent': this.userAgent,
      },
    });
  }

  protected async fetch(url: string) {
    try {
      return await this.#authenticatedFetch(url);
    } catch (err) {
      if (err instanceof CzdsClientError && err.response.status === 401) {
        await this.token.fetch();
        return await this.#authenticatedFetch(url);
      }
      throw err;
    }
  }
}

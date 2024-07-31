import { CzdsClientError } from './czds-client-error';
import { IcannCredentials } from './icann-credentials';
import tryFetch from './try-fetch';

export default class Token {
  private token: string | undefined;

  constructor(private readonly credentials: IcannCredentials) {}

  async fetch() {
    this.token = undefined;

    const response = await tryFetch(
      'https://account-api.icann.org/api/authenticate',
      {
        method: 'POST',
        body: JSON.stringify(this.credentials),
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
    );

    const bodyStr = await response.text();
    let body: { accessToken: string };
    try {
      body = JSON.parse(bodyStr) as { accessToken: string };
    } catch (err) {
      throw new CzdsClientError(
        `Failed to parse the authentication response as JSON: ${bodyStr}`,
        response,
        bodyStr,
      );
    }

    if (typeof body.accessToken !== 'string') {
      throw new CzdsClientError(
        'ICANN API authentication failed',
        response,
        bodyStr,
      );
    }

    this.token = body.accessToken;
  }

  get bearer() {
    return `Bearer ${this.token}`;
  }
}

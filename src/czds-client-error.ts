interface CzdsResponse {
  status: number;
  headers: Record<string, string>;
  body: string;
}

export class CzdsClientError extends Error {
  readonly response: CzdsResponse;

  constructor(message: string, response: Response, body: string) {
    super(message);
    this.response = {
      status: response.status,
      headers: Object.fromEntries(response.headers),
      body,
    };
  }
}

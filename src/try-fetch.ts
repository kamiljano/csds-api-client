import { CzdsClientError } from './czds-client-error';

export default async function tryFetch(url: string, opts: RequestInit) {
  const response = await fetch(url, opts);
  if (!response.ok) {
    throw new CzdsClientError(
      `Failed to fetch ${url}`,
      response,
      await response.text(),
    );
  }
  return response;
}

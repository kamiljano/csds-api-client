import { describe, test, expect, beforeAll } from 'vitest';
import CzdsClient from '../src/index';

const getMandatoryEnvVar = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing mandatory environment variable: ${name}`);
  }
  return value;
};

const username = getMandatoryEnvVar('ICANN_USERNAME');
const password = getMandatoryEnvVar('ICANN_PASSWORD');

describe('CzdsClient', () => {
  let client: CzdsClient;

  beforeAll(async () => {
    client = await CzdsClient.authenticate({
      credentials: {
        username,
        password,
      },
      userAgent: 'czds-client-test-automation',
    });

    expect(client).toBeInstanceOf(CzdsClient);
  });

  test('listZoneDownloadLinks', async () => {
    const result = await client.listZoneDownloadLinks();
    expect(result).toBeInstanceOf(Array);
    for (const link of result) {
      expect(link.url).toMatch(/^https:\/\/czds-download.+/);
    }

    const text = await result[0].getText();

    expect(text).toContain('nic.xn--zfr164b.');
  });

  describe('getZone', () => {
    test('success', async () => {
      const zone = client.getZone('gov');
      const text = await zone.getText();

      expect(text).toContain('gov.');
    });

    test('failure', async () => {
      await expect(client.getZone('invalid-zone').getText()).rejects.toThrow(
        /^Failed to fetch/,
      );
    });
  });
});

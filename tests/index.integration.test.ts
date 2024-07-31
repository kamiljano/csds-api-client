import { describe, test, expect, beforeAll } from 'vitest';
import CzdsClient from '../src/index';
import getMandatoryEnvVar from './get-mandatory-env-var';
import { CzdsClientError } from '../src/czds-client-error';

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
        CzdsClientError,
      );
    });
  });
});

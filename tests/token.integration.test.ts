import { describe, test, expect, beforeAll } from 'vitest';
import Token from '../src/token';
import getMandatoryEnvVar from './get-mandatory-env-var';
import { CzdsClientError } from '../src/czds-client-error';

const username = getMandatoryEnvVar('ICANN_USERNAME');
const password = getMandatoryEnvVar('ICANN_PASSWORD');

describe('Token', () => {
  test('success', async () => {
    const token = new Token({ username, password });
    await token.fetch();

    expect(token.bearer).toMatch(/^Bearer .+/);
  });

  test('failure', async () => {
    const token = new Token({ username, password: 'wrong' });
    expect(token.fetch()).rejects.toThrow(CzdsClientError);
  });
});

import { getMsalInstance } from './msalInstance';
import { GRAPH_SCOPES } from './msalConfig';

export async function getAccessToken(): Promise<string> {
  const instance = await getMsalInstance();
  const accounts = await instance.getAccounts();

  if (accounts.length > 0) {
    try {
      const result = await instance.acquireTokenSilent({
        scopes: GRAPH_SCOPES,
        account: accounts[0],
      });
      if (result) return result.accessToken;
    } catch {
      // Silent failed — fall through to interactive
    }
  }

  const result = await instance.acquireToken({ scopes: GRAPH_SCOPES });
  if (!result) throw new Error('Authentication cancelled or failed.');
  return result.accessToken;
}

export async function signOut(): Promise<void> {
  const instance = await getMsalInstance();
  const accounts = await instance.getAccounts();
  if (accounts.length > 0) {
    await instance.signOut({ account: accounts[0] });
  }
}

export async function getSignedInAccount() {
  const instance = await getMsalInstance();
  const accounts = await instance.getAccounts();
  return accounts.length > 0 ? accounts[0] : null;
}

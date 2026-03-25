import PublicClientApplication from 'react-native-msal';
import { MSAL_CONFIG } from './msalConfig';

let _instance: PublicClientApplication | null = null;

export async function getMsalInstance(): Promise<PublicClientApplication> {
  if (!_instance) {
    const instance = new PublicClientApplication(MSAL_CONFIG);
    await instance.init(); // only assign after successful init
    _instance = instance;
  }
  return _instance;
}

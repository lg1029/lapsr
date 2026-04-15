import Constants from 'expo-constants';

const clientId: string = Constants.expoConfig?.extra?.msalClientId ?? '';
const tenantId: string = Constants.expoConfig?.extra?.msalTenantId ?? '';

export const MSAL_CONFIG = {
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/organizations`,
    redirectUri: 'msauth.com.laurengrassano.lapsr://auth',
  },
};

export const GRAPH_SCOPES = [
  'https://graph.microsoft.com/DeviceLocalCredential.Read.All',
  'https://graph.microsoft.com/Device.Read.All',
  'https://graph.microsoft.com/User.Read.All',
  'https://graph.microsoft.com/BitLockerKey.ReadBasic.All',
  'https://graph.microsoft.com/BitLockerKey.Read.All',
];

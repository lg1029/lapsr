export interface GraphOwner {
  id: string;
  displayName?: string;
  userPrincipalName?: string;
}

export interface GraphDeviceResponse {
  value: GraphDevice[];
}

export interface GraphDevice {
  id: string;
  displayName: string;
  operatingSystem?: string;
  approximateLastSignInDateTime?: string;
  registeredOwners?: GraphOwner[];
}

export interface GraphUserResponse {
  value: GraphUser[];
}

export interface GraphUser {
  id: string;
  displayName?: string;
  userPrincipalName?: string;
}

export interface GraphLapsResponse {
  credentials: GraphLapsCredential[];
}

export interface GraphLapsCredential {
  deviceName: string;
  id: string;
  refreshDateTime: string;
  backupDateTime: string;
  passwordBase64: string;
}

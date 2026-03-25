export interface DeviceOwner {
  id: string;
  displayName?: string;
  userPrincipalName?: string;
}

export interface Device {
  id: string;
  deviceId: string;
  displayName: string;
  operatingSystem?: string;
  operatingSystemVersion?: string;
  trustType?: string;
  isCompliant?: boolean;
  isManaged?: boolean;
  manufacturer?: string;
  model?: string;
  approximateLastSignInDateTime?: string;
  registeredOwners?: DeviceOwner[];
}

export interface LapsCredential {
  deviceName: string;
  id: string;
  refreshDateTime: string;
  backupDateTime: string;
  passwordBase64: string;
}

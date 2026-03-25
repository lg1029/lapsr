import { graphClient } from './graphClient';
import { GraphUserResponse, GraphDeviceResponse } from '../types/graph';
import { Device, DeviceOwner } from '../types/device';

export interface User {
  id: string;
  displayName: string;
  userPrincipalName: string;
  jobTitle?: string;
  department?: string;
}

const DEVICE_SELECT = 'id,deviceId,displayName,operatingSystem,approximateLastSignInDateTime';

export async function getAllUsers(): Promise<User[]> {
  const response = await graphClient.get<GraphUserResponse>('/users', {
    params: {
      $select: 'id,displayName,userPrincipalName,jobTitle,department',
      $top: 100,
    },
  });
  return (response.data.value as User[])
    .filter((u) => u.displayName)
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
}

export async function searchUsers(query: string): Promise<User[]> {
  const response = await graphClient.get<GraphUserResponse>('/users', {
    headers: { ConsistencyLevel: 'eventual' },
    params: {
      $filter: `startswith(displayName,'${query}') or startswith(userPrincipalName,'${query}')`,
      $select: 'id,displayName,userPrincipalName,jobTitle,department',
      $count: true,
      $top: 25,
    },
  });
  return response.data.value as User[];
}

export async function getUserDevices(userId: string, owner: DeviceOwner): Promise<Device[]> {
  const response = await graphClient.get<GraphDeviceResponse>(
    `/users/${userId}/registeredDevices`,
    { params: { $select: DEVICE_SELECT } }
  );
  return response.data.value.map((d) => ({ ...d, registeredOwners: [owner] }));
}

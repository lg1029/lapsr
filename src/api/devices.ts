import { graphClient } from './graphClient';
import { Device } from '../types/device';
import { GraphDeviceResponse, GraphUserResponse, GraphDeviceResponse as GraphRegisteredDevicesResponse } from '../types/graph';

const DEVICE_SELECT = 'id,deviceId,displayName,operatingSystem,approximateLastSignInDateTime';
const DEVICE_EXPAND = 'registeredOwners($select=id,displayName,userPrincipalName)';

function escapeOData(value: string): string {
  return value.replace(/'/g, "''");
}

function hasDeviceId<T extends { deviceId?: string }>(d: T): d is T & { deviceId: string } {
  return !!d.deviceId;
}

export async function searchDeviceByName(name: string): Promise<Device[]> {
  const response = await graphClient.get<GraphDeviceResponse>('/devices', {
    headers: { ConsistencyLevel: 'eventual' },
    params: {
      $filter: `startswith(displayName,'${escapeOData(name)}')`,
      $select: DEVICE_SELECT,
      $expand: DEVICE_EXPAND,
      $count: true,
      $top: 20,
    },
  });
  return response.data.value.filter(hasDeviceId) as Device[];
}

export async function searchDevicesByUser(userName: string): Promise<Device[]> {
  // Find users matching the name
  const usersResponse = await graphClient.get<GraphUserResponse>('/users', {
    headers: { ConsistencyLevel: 'eventual' },
    params: {
      $filter: `startswith(displayName,'${escapeOData(userName)}') or startswith(userPrincipalName,'${escapeOData(userName)}')`,
      $select: 'id,displayName,userPrincipalName',
      $count: true,
      $top: 10,
    },
  });

  const users = usersResponse.data.value;
  if (users.length === 0) return [];

  // Fetch registered devices for each matched user in parallel
  const deviceArrays = await Promise.all(
    users.map(async (user) => {
      try {
        const devResponse = await graphClient.get<GraphRegisteredDevicesResponse>(
          `/users/${user.id}/registeredDevices`,
          {
            params: {
              $select: DEVICE_SELECT,
            },
          }
        );
        // Attach the owner so the list item can display it
        return devResponse.data.value
          .filter(hasDeviceId)
          .map((d) => ({
            ...d,
            registeredOwners: [{ id: user.id, displayName: user.displayName, userPrincipalName: user.userPrincipalName }],
          })) as Device[];
      } catch {
        return [];
      }
    })
  );

  // Flatten and deduplicate by device id
  const seen = new Set<string>();
  const results: Device[] = [];
  for (const devices of deviceArrays) {
    for (const device of devices) {
      if (!seen.has(device.id)) {
        seen.add(device.id);
        results.push(device);
      }
    }
  }
  return results;
}

export async function getDeviceById(id: string): Promise<Device> {
  const response = await graphClient.get<Device>(`/devices/${id}`, {
    params: {
      $select: 'id,deviceId,displayName,operatingSystem,operatingSystemVersion,trustType,isCompliant,isManaged,manufacturer,model,approximateLastSignInDateTime',
      $expand: DEVICE_EXPAND,
    },
  });
  return response.data;
}

export async function getAllDevices(): Promise<Device[]> {
  const response = await graphClient.get<GraphDeviceResponse>('/devices', {
    params: {
      $select: DEVICE_SELECT,
      $top: 100,
    },
  });
  return response.data.value
    .filter(hasDeviceId)
    .sort((a, b) => (a.displayName ?? '').localeCompare(b.displayName ?? '')) as Device[];
}

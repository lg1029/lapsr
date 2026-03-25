import { graphClient } from './graphClient';

export interface BitLockerKey {
  id: string;
  createdDateTime: string;
  volumeType: string;
  deviceId: string;
  key?: string;
}

interface BitLockerKeysResponse {
  value: BitLockerKey[];
}

export async function getBitLockerKeys(deviceId: string): Promise<BitLockerKey[]> {
  // List keys for the device (requires BitLockerKey.ReadBasic.All)
  const listResponse = await graphClient.get<BitLockerKeysResponse>(
    '/informationProtection/bitlocker/recoveryKeys',
    {
      headers: { ConsistencyLevel: 'eventual' },
      params: {
        $filter: `deviceId eq '${deviceId}'`,
        $select: 'id,createdDateTime,volumeType,deviceId',
        $count: true,
      },
    }
  );

  const keys = listResponse.data.value;
  if (keys.length === 0) return [];

  // Fetch the actual key value for each (requires BitLockerKey.Read.All)
  const withKeys = await Promise.all(
    keys.map(async (k) => {
      try {
        const detail = await graphClient.get<BitLockerKey>(
          `/informationProtection/bitlocker/recoveryKeys/${k.id}`,
          { params: { $select: 'key' } }
        );
        return { ...k, key: detail.data.key };
      } catch {
        return k;
      }
    })
  );

  return withKeys;
}

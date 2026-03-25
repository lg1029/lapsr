import { graphClient } from './graphClient';
import { LapsCredential } from '../types/device';
import { GraphLapsResponse } from '../types/graph';

export async function getLapsPassword(deviceId: string): Promise<LapsCredential> {
  try {
    const response = await graphClient.get<GraphLapsResponse>(
      `/directory/deviceLocalCredentials/${deviceId}?$select=credentials`
    );

    const credentials = response.data.credentials;

    if (!credentials || credentials.length === 0) {
      throw new Error('NO_LAPS');
    }

    // Sort by backupDateTime descending — take the most recent
    const sorted = [...credentials].sort(
      (a, b) => new Date(b.backupDateTime).getTime() - new Date(a.backupDateTime).getTime()
    );

    return sorted[0];
  } catch (error: any) {
    if (error?.response?.status === 404 || error?.message === 'NO_LAPS') {
      throw new Error('No LAPS password configured for this device.');
    }
    throw error;
  }
}

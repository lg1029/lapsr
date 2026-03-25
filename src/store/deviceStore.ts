import { create } from 'zustand';
import { Device, LapsCredential } from '../types/device';

interface DeviceState {
  searchQuery: string;
  searchResults: Device[];
  allDevices: Device[];
  recentDevices: Device[];
  selectedDevice: Device | null;
  lapsCredential: LapsCredential | null;
  isLoading: boolean;
  error: string | null;
  setSearchQuery: (q: string) => void;
  setSearchResults: (results: Device[]) => void;
  setAllDevices: (devices: Device[]) => void;
  setSelectedDevice: (device: Device) => void;
  addRecentDevice: (device: Device) => void;
  setLapsCredential: (cred: LapsCredential) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
  clearDevice: () => void;
}

export const useDeviceStore = create<DeviceState>((set) => ({
  searchQuery: '',
  searchResults: [],
  allDevices: [],
  recentDevices: [],
  selectedDevice: null,
  lapsCredential: null,
  isLoading: false,
  error: null,
  setSearchQuery: (q) => set({ searchQuery: q }),
  setSearchResults: (results) => set({ searchResults: results }),
  setAllDevices: (devices) => set({ allDevices: devices }),
  setSelectedDevice: (device) => set({ selectedDevice: device, lapsCredential: null, error: null }),
  addRecentDevice: (device) =>
    set((state) => {
      const filtered = state.recentDevices.filter((d) => d.id !== device.id);
      return { recentDevices: [device, ...filtered].slice(0, 5) };
    }),
  setLapsCredential: (cred) => set({ lapsCredential: cred }),
  setLoading: (v) => set({ isLoading: v }),
  setError: (e) => set({ error: e }),
  clearDevice: () => set({ selectedDevice: null, lapsCredential: null, error: null }),
}));

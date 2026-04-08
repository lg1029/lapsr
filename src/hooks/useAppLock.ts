import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../store/authStore';
import { useDeviceStore } from '../store/deviceStore';

const BACKGROUND_LOCK_MS = 5 * 60 * 1000;     // Lock after 5 min in background
const SESSION_TIMEOUT_MS = 8 * 60 * 60 * 1000; // Force re-auth after 8 hours
const SESSION_KEY = 'lapsr_session_start';

export function useAppLock() {
  const backgroundSince = useRef<number | null>(null);
  const { isAuthenticated, clearAuth } = useAuthStore();
  const { clearDevice } = useDeviceStore();

  // Keep a ref so the AppState handler always sees the current auth state
  const isAuthRef = useRef(isAuthenticated);
  useEffect(() => { isAuthRef.current = isAuthenticated; }, [isAuthenticated]);

  // Record session start on login; clear on logout
  useEffect(() => {
    if (isAuthenticated) {
      SecureStore.getItemAsync(SESSION_KEY).then((val) => {
        if (!val) {
          SecureStore.setItemAsync(SESSION_KEY, String(Date.now())).catch(() => {});
        }
      });
    } else {
      SecureStore.deleteItemAsync(SESSION_KEY).catch(() => {});
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'background') {
        backgroundSince.current = Date.now();
      } else if (nextState === 'active') {
        if (!isAuthRef.current) return;

        (async () => {
          // Session timeout check
          try {
            const val = await SecureStore.getItemAsync(SESSION_KEY);
            if (val && Date.now() - parseInt(val, 10) > SESSION_TIMEOUT_MS) {
              clearDevice();
              clearAuth();
              return;
            }
          } catch {}

          // Background lock check
          if (backgroundSince.current !== null) {
            if (Date.now() - backgroundSince.current >= BACKGROUND_LOCK_MS) {
              clearDevice();
              clearAuth();
            }
            backgroundSince.current = null;
          }
        })();
      }
    });
    return () => sub.remove();
  }, []);
}

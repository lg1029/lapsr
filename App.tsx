import { StatusBar } from 'expo-status-bar';
import RootNavigator from './src/navigation/RootNavigator';
import PrivacyOverlay from './src/components/PrivacyOverlay';
import { useAppLock } from './src/hooks/useAppLock';

function AppContent() {
  useAppLock();
  return (
    <>
      <StatusBar style="light" backgroundColor="#0078D4" />
      <RootNavigator />
      <PrivacyOverlay />
    </>
  );
}

export default function App() {
  return <AppContent />;
}

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';

import { getMsalInstance } from '../auth/msalInstance';
import { useAuthStore } from '../store/authStore';

import LoginScreen from '../screens/LoginScreen';
import MainTabNavigator from './MainTabNavigator';

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const [initializing, setInitializing] = useState(true);
  const { isAuthenticated, setAuthenticated } = useAuthStore();

  useEffect(() => {
    async function checkExistingAccount() {
      try {
        const instance = await getMsalInstance();
        const accounts = await instance.getAccounts();
        if (accounts.length > 0) {
          setAuthenticated(accounts[0].username ?? accounts[0].identifier);
        }
      } catch {
        // No existing session
      } finally {
        setInitializing(false);
      }
    }
    checkExistingAccount();
  }, []);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0078D4" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainTabNavigator} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

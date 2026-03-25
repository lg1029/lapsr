import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import DevicesScreen from '../screens/DevicesScreen';
import LapsScreen from '../screens/LapsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import UsersScreen from '../screens/UsersScreen';
import UserDevicesScreen from '../screens/UserDevicesScreen';

export type DevicesStackParamList = {
  DevicesList: undefined;
  Laps: undefined;
};

export type UsersStackParamList = {
  UsersList: undefined;
  UserDevices: { userId: string; userName: string; userPrincipalName: string };
  Laps: undefined;
};

const Tab = createBottomTabNavigator();
const DevicesStack = createNativeStackNavigator<DevicesStackParamList>();
const UsersStack = createNativeStackNavigator<UsersStackParamList>();

function DevicesNavigator() {
  return (
    <DevicesStack.Navigator screenOptions={{ headerShown: false }}>
      <DevicesStack.Screen name="DevicesList" component={DevicesScreen} />
      <DevicesStack.Screen name="Laps" component={LapsScreen} />
    </DevicesStack.Navigator>
  );
}

function UsersNavigator() {
  return (
    <UsersStack.Navigator screenOptions={{ headerShown: false }}>
      <UsersStack.Screen name="UsersList" component={UsersScreen} />
      <UsersStack.Screen name="UserDevices" component={UserDevicesScreen} />
      <UsersStack.Screen name="Laps" component={LapsScreen} />
    </UsersStack.Navigator>
  );
}

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Devices') {
            iconName = focused ? 'laptop' : 'laptop-outline';
          } else if (route.name === 'Users') {
            iconName = focused ? 'people' : 'people-outline';
          } else {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0078D4',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E8EDF2',
          borderTopWidth: 1,
          paddingBottom: 4,
          paddingTop: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Devices" component={DevicesNavigator} />
      <Tab.Screen name="Users" component={UsersNavigator} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

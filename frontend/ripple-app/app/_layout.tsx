import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0a0a0f',
          borderTopColor: '#1a1a2e',
          borderTopWidth: 1,
          paddingBottom: 8,
          height: 60,
        },
        tabBarActiveTintColor: '#7F77DD',
        tabBarInactiveTintColor: '#444',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Login',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👤</Text>,
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🌊</Text>,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>✏️</Text>,
        }}
      />
      <Tabs.Screen
        name="signup"
        options={{
          title: 'Sign Up',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>✨</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>⚡</Text>,
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: 'Circles',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👥</Text>,
        }}
      />
    </Tabs>
  );
}
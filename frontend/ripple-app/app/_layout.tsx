import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';

function TabLayout() {
  const { user } = useAuth();
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          height: 60,
        },
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textTertiary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Login',
          href: user ? null : '/index',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👤</Text>,
        }}
      />
      <Tabs.Screen
        name="signup"
        options={{
          title: 'Sign Up',
          href: user ? null : '/signup',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>✨</Text>,
        }}
      />
      <Tabs.Screen
        name="videos"
        options={{
          title: 'Videos',
          href: user ? '/videos' : null,
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🎬</Text>,
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Feed',
          href: user ? '/feed' : null,
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🌊</Text>,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          href: user ? '/create' : null,
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>✏️</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          href: user ? '/profile' : null,
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>⚡</Text>,
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: 'Circles',
          href: user ? '/groups' : null,
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👥</Text>,
        }}
      />
      <Tabs.Screen
        name="battles"
        options={{
          title: 'Battles',
          href: user ? '/battles' : null,
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>⚔️</Text>,
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Ranks',
          href: user ? '/leaderboard' : null,
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🏆</Text>,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          href: user ? '/search' : null,
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🔍</Text>,
        }}
      />
    </Tabs>
  );
}

export default function Layout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TabLayout />
      </AuthProvider>
    </ThemeProvider>
  );
}
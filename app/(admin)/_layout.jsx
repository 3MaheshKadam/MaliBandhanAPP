import { Stack } from 'expo-router';
import { Colors } from '../../constants/Colors';

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerTintColor: Colors.primary,
        headerTransparent: true,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        contentStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen name="dashboard" options={{ title: 'Admin Dashboard' }} />
      <Stack.Screen name="user-management" options={{ title: 'User Management' }} />
      <Stack.Screen name="verification" options={{ title: 'Verification Requests' }} />
    </Stack>
  );
}
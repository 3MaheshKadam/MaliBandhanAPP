import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useSession } from '../context/SessionContext';

export default function Index() {
  const { user, loading } = useSession();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-transparent">
        <ActivityIndicator size="large" color="#f43f5e" />
      </View>
    );
  }

  // Check if user exists and has completed profile setup
  const isAuthenticated = !!user;
  const hasCompletedProfile = user?.profileCompleted;

  return isAuthenticated ? (
    hasCompletedProfile ? (
      <Redirect href="/(dashboard)/(tabs)/matches" />
    ) : (
      <Redirect href="/(auth)/login" />
    )
  ) : (
    <Redirect href="/(auth)/login" />
  );
}
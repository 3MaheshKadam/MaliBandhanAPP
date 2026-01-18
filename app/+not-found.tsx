import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link, Stack } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Colors } from '../constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <BlurView intensity={30} tint="light" style={styles.card}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>?</Text>
        </View>
        <Text style={styles.title}>Page Not Found</Text>
        <Text style={styles.description}>
          The page you are looking for does not exist.
        </Text>

        <Link href="/" asChild>
          <TouchableOpacity style={styles.button}>
            <LinearGradient
              colors={[Colors.primary, Colors.primaryLight]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>Go to Home</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Link>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'transparent',
  },
  card: {
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    width: '100%',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    fontSize: 40,
    color: Colors.white,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  description: {
    textAlign: 'center',
    marginBottom: 30,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
});
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

export default function PaymentSuccess() {
  return (
    <View style={styles.container}>
      <BlurView intensity={30} tint="light" style={styles.card}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>✓</Text>
        </View>

        <Text style={styles.title}>Payment Successful!</Text>
        <Text style={styles.message}>
          Thank you for your subscription. You now have access to premium features.
        </Text>

        <TouchableOpacity style={styles.button} onPress={() => { }}>
          <LinearGradient
            colors={[Colors.success, Colors.lightSuccess]}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.buttonText}>Continue to App</Text>
          </LinearGradient>
        </TouchableOpacity>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.lightSuccess,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    fontSize: 40,
    color: Colors.success,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    marginBottom: 30,
    color: Colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
  },
  button: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
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
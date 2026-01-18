import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Colors } from '../../constants/Colors';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>
      <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
        <BlurView intensity={30} tint="light" style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join Mali Bandhan today</Text>
          </View>

          <View style={styles.form}>
            <TextInput
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
              style={styles.input}
              placeholderTextColor={Colors.textLight}
            />

            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              placeholderTextColor={Colors.textLight}
            />

            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
              placeholderTextColor={Colors.textLight}
            />

            <TouchableOpacity style={styles.button} onPress={() => { }}>
              <LinearGradient
                colors={[Colors.primary, Colors.primaryLight]}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.buttonText}>Register</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(155, 107, 158, 0.2)',
  },
  header: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  form: {
    padding: 24,
    gap: 16,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
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
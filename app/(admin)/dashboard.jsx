import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '../../constants/Colors';

const stats = [
  { label: 'Total Users', value: '1,234' },
  { label: 'Active Today', value: '456' },
  { label: 'New Signups', value: '78' },
  { label: 'Pending Verifications', value: '23' },
];

export default function AdminDashboard() {
  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: 'transparent' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Admin Dashboard</Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {stats.map((stat, index) => (
          <View key={index} style={{
            width: '48%',
            borderRadius: 10,
            marginBottom: 15,
            overflow: 'hidden',
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.2)'
          }}>
            <BlurView intensity={50} tint="light" style={StyleSheet.absoluteFill} />
            <View style={{ padding: 15 }}>
              <Text style={{ fontSize: 16, color: Colors.textSecondary, marginBottom: 4 }}>{stat.label}</Text>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: Colors.textPrimary }}>{stat.value}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
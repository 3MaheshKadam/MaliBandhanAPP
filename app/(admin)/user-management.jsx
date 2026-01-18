import { View, Text, FlatList, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '../../constants/Colors';

const users = [
  { id: '1', name: 'Rahul Sharma', email: 'rahul@example.com', status: 'active' },
  { id: '2', name: 'Priya Patel', email: 'priya@example.com', status: 'active' },
  { id: '3', name: 'Amit Singh', email: 'amit@example.com', status: 'suspended' },
];

export default function UserManagement() {
  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 10, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
            <BlurView intensity={30} tint="light" style={{ padding: 15 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary }}>{item.name}</Text>
              <Text style={{ color: Colors.textSecondary }}>{item.email}</Text>
              <Text style={{ color: item.status === 'active' ? Colors.success : Colors.danger, fontWeight: '600', marginTop: 4 }}>
                {item.status.toUpperCase()}
              </Text>
            </BlurView>
          </View>
        )}
        contentContainerStyle={{ padding: 20 }}
      />
    </View>
  );
}
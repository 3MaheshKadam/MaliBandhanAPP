import { View, Text, FlatList, Button, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { BlurView } from 'expo-blur';

const requests = [
  { id: '1', name: 'Neha Gupta', submitted: '2 days ago' },
  { id: '2', name: 'Vikram Joshi', submitted: '1 day ago' },
  { id: '3', name: 'Ananya Reddy', submitted: '5 hours ago' },
];

export default function Verification() {
  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{
            marginBottom: 10,
            borderRadius: 12,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.2)'
          }}>
            <BlurView intensity={30} tint="light" style={{
              padding: 15,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <View>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary }}>{item.name}</Text>
                <Text style={{ color: Colors.textSecondary }}>Submitted {item.submitted}</Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Button title="Approve" color={Colors.primary} onPress={() => { }} />
                <View style={{ width: 10 }} />
                <Button title="Reject" color={Colors.danger} onPress={() => { }} />
              </View>
            </BlurView>
          </View>
        )}
        contentContainerStyle={{ padding: 20 }}
      />
    </View>
  );
}
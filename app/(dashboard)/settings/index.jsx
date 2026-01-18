// import { View, Text, Switch,Pressable } from 'react-native';
// import { Colors } from '../../../constants/Colors';
// import { useState } from 'react';
// export default function Settings() {
//   const [notificationsEnabled, setNotificationsEnabled] = useState(true);
//   const [darkMode, setDarkMode] = useState(false);

//   return (
//     <View style={{ flex: 1, padding: 20 }}>
//       <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Settings</Text>

//       <View style={{ marginBottom: 15 }}>
//         <Text style={{ fontSize: 18, marginBottom: 10 }}>Notifications</Text>
//         <Switch
//           value={notificationsEnabled}
//           onValueChange={setNotificationsEnabled}
//           thumbColor={Colors.primary}
//         />
//       </View>

//       <View style={{ marginBottom: 15 }}>
//         <Text style={{ fontSize: 18, marginBottom: 10 }}>Dark Mode</Text>
//         <Switch
//           value={darkMode}
//           onValueChange={setDarkMode}
//           thumbColor={Colors.primary}
//         />
//       </View>

//       <Pressable style={{ marginTop: 30 }}>
//         <Text style={{ color: Colors.danger, fontSize: 18 }}>Logout</Text>
//       </Pressable>
//     </View>
//   );
// }
import { View, Text, Switch, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '../../../constants/Colors';
import { BlurView } from 'expo-blur';
import { useState } from 'react';
import {
  Bell,
  Moon,
  Sun,
  Lock,
  Shield,
  HelpCircle,
  Info,
  LogOut,
  ChevronRight,
  User,
  Heart,
  Eye,
  Mail
} from 'lucide-react-native';

export default function Settings() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [privateMode, setPrivateMode] = useState(false);
  const [showOnline, setShowOnline] = useState(true);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BlurView intensity={90} tint="light" style={StyleSheet.absoluteFill} />
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <View style={styles.card}>
            <BlurView intensity={70} tint="light" style={StyleSheet.absoluteFill} />
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.iconContainer}>
                  <Bell size={20} color={Colors.primary} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Notifications</Text>
                  <Text style={styles.settingSubtitle}>Receive match alerts</Text>
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: Colors.backgroundTertiary, true: Colors.primaryLight }}
                thumbColor={notificationsEnabled ? Colors.primary : Colors.textLight}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.iconContainer}>
                  {darkMode ? (
                    <Moon size={20} color={Colors.primary} />
                  ) : (
                    <Sun size={20} color={Colors.primary} />
                  )}
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Dark Mode</Text>
                  <Text style={styles.settingSubtitle}>Change app theme</Text>
                </View>
              </View>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: Colors.backgroundTertiary, true: Colors.primaryLight }}
                thumbColor={darkMode ? Colors.primary : Colors.textLight}
              />
            </View>
          </View>
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>

          <View style={styles.card}>
            <BlurView intensity={70} tint="light" style={StyleSheet.absoluteFill} />
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.iconContainer}>
                  <Eye size={20} color={Colors.primary} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Show Online Status</Text>
                  <Text style={styles.settingSubtitle}>Let others see when you're active</Text>
                </View>
              </View>
              <Switch
                value={showOnline}
                onValueChange={setShowOnline}
                trackColor={{ false: Colors.backgroundTertiary, true: Colors.primaryLight }}
                thumbColor={showOnline ? Colors.primary : Colors.textLight}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.iconContainer}>
                  <Shield size={20} color={Colors.primary} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Private Mode</Text>
                  <Text style={styles.settingSubtitle}>Hide profile from searches</Text>
                </View>
              </View>
              <Switch
                value={privateMode}
                onValueChange={setPrivateMode}
                trackColor={{ false: Colors.backgroundTertiary, true: Colors.primaryLight }}
                thumbColor={privateMode ? Colors.primary : Colors.textLight}
              />
            </View>
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <View style={styles.card}>
            <BlurView intensity={70} tint="light" style={StyleSheet.absoluteFill} />
            <Pressable style={styles.menuItem}>
              <View style={styles.settingLeft}>
                <View style={styles.iconContainer}>
                  <User size={20} color={Colors.primary} />
                </View>
                <Text style={styles.menuItemText}>Edit Profile</Text>
              </View>
              <ChevronRight size={20} color={Colors.textLight} />
            </Pressable>

            <View style={styles.divider} />

            <Pressable style={styles.menuItem}>
              <View style={styles.settingLeft}>
                <View style={styles.iconContainer}>
                  <Lock size={20} color={Colors.primary} />
                </View>
                <Text style={styles.menuItemText}>Change Password</Text>
              </View>
              <ChevronRight size={20} color={Colors.textLight} />
            </Pressable>

            <View style={styles.divider} />

            <Pressable style={styles.menuItem}>
              <View style={styles.settingLeft}>
                <View style={styles.iconContainer}>
                  <Heart size={20} color={Colors.primary} />
                </View>
                <Text style={styles.menuItemText}>Blocked Users</Text>
              </View>
              <ChevronRight size={20} color={Colors.textLight} />
            </Pressable>
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>

          <View style={styles.card}>
            <BlurView intensity={70} tint="light" style={StyleSheet.absoluteFill} />
            <Pressable style={styles.menuItem}>
              <View style={styles.settingLeft}>
                <View style={styles.iconContainer}>
                  <HelpCircle size={20} color={Colors.primary} />
                </View>
                <Text style={styles.menuItemText}>Help Center</Text>
              </View>
              <ChevronRight size={20} color={Colors.textLight} />
            </Pressable>

            <View style={styles.divider} />

            <Pressable style={styles.menuItem}>
              <View style={styles.settingLeft}>
                <View style={styles.iconContainer}>
                  <Mail size={20} color={Colors.primary} />
                </View>
                <Text style={styles.menuItemText}>Contact Us</Text>
              </View>
              <ChevronRight size={20} color={Colors.textLight} />
            </Pressable>

            <View style={styles.divider} />

            <Pressable style={styles.menuItem}>
              <View style={styles.settingLeft}>
                <View style={styles.iconContainer}>
                  <Info size={20} color={Colors.primary} />
                </View>
                <Text style={styles.menuItemText}>About Mali Bandhan</Text>
              </View>
              <ChevronRight size={20} color={Colors.textLight} />
            </Pressable>
          </View>
        </View>

        {/* Logout Button */}
        <Pressable style={styles.logoutButton}>
          <LogOut size={20} color={Colors.danger} />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: 'SpaceMono',
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    fontFamily: 'SpaceMono',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.secondaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontFamily: 'SpaceMono',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: 'SpaceMono',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginLeft: 68,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
    fontFamily: 'SpaceMono',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.lightDanger,
    marginHorizontal: 16,
    marginTop: 32,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.danger,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.danger,
    fontFamily: 'SpaceMono',
  },
});
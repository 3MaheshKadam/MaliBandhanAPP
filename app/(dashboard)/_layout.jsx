import React, { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Heart, Users, User, Settings } from 'lucide-react-native';
import { useSession } from '../../context/SessionContext';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const TAB_WIDTH = width / 4;

const TabBarIcon = ({ name, color, focused, size = 20 }) => {
  const scale = useSharedValue(focused ? 1 : 0.9);
  const rotate = useSharedValue(0);

  useEffect(() => {
    if (focused) {
      scale.value = withSpring(1, { damping: 8, stiffness: 100 });
      rotate.value = withSpring(360, { damping: 10, stiffness: 80 });
    } else {
      scale.value = withSpring(0.9, { damping: 8, stiffness: 100 });
      rotate.value = withTiming(0, { duration: 200 });
    }
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotate.value}deg` }
    ],
  }));

  const IconComponent = {
    heart: Heart,
    users: Users,
    user: User,
    settings: Settings,
  }[name] || User;

  return (
    <Animated.View style={animatedStyle}>
      <IconComponent
        size={size}
        color={color}
        strokeWidth={focused ? 2.5 : 2}
        fill={focused ? color : 'transparent'}
      />
    </Animated.View>
  );
};

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const translateX = useSharedValue(0);
  const pillWidth = useSharedValue(TAB_WIDTH - 16);

  useEffect(() => {
    // Smooth sliding pill animation
    translateX.value = withTiming(state.index * TAB_WIDTH, {
      duration: 300,
      easing: Easing.out(Easing.cubic)
    });
  }, [state.index]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    width: pillWidth.value,
  }));

  return (
    <View style={styles.container}>
      <View style={[
        styles.tabBarWrapper,
        {
          paddingBottom: Math.max(insets.bottom, 12), // Ensure at least some padding
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.borderLight,
          elevation: 10, // Shadow for Android
          shadowColor: '#000', // Shadow for iOS
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }
      ]}>
        <View style={styles.tabBar}>
          {/* Sliding Pill Background */}
          <Animated.View style={[styles.pillContainer, pillStyle]} pointerEvents="none">
            <LinearGradient
              colors={[`${Colors.primary}20`, `${Colors.primaryLight}20`]} // Much lighter pill
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.pill}
            />
          </Animated.View>

          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

            if (!options.tabBarIcon) return null;

            const iconName = route.name.includes('matches') ? 'heart' :
              route.name.includes('interests') ? 'users' :
                route.name.includes('profile') ? 'user' : 'settings';

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            };

            return (
              <TabButton
                key={route.key}
                iconName={iconName}
                label={options.title}
                isFocused={isFocused}
                onPress={onPress}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
};

const TabButton = ({ iconName, label, isFocused, onPress }) => {
  const labelOpacity = useSharedValue(0.6);

  useEffect(() => {
    labelOpacity.value = withTiming(isFocused ? 1 : 0.6, {
      duration: 200
    });
  }, [isFocused]);

  const labelStyle = useAnimatedStyle(() => ({
    opacity: labelOpacity.value,
  }));

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.tabButton}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <TabBarIcon
          name={iconName}
          color={isFocused ? Colors.primary : Colors.textLight} // Active is Primary color now
          focused={isFocused}
          size={isFocused ? 24 : 22}
        />
      </View>

      <Animated.Text
        style={[
          styles.label,
          { color: isFocused ? Colors.primary : Colors.textLight }, // Active is Primary
          labelStyle
        ]}
        numberOfLines={1}
      >
        {label}
      </Animated.Text>
    </TouchableOpacity>
  );
};

import { BackHandler, Alert } from 'react-native';
import { usePathname, useRouter } from 'expo-router';

export default function MaliBandhanDashboardLayout() {
  const { user } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  // Intelligent Back Button Handling
  useEffect(() => {
    const backAction = () => {
      // Check if we are currently on the "Matches" (Home) tab
      // Pathname might contain deep links, so we check for inclusion
      const isHomeTab = pathname.includes('matches');

      if (!isHomeTab) {
        // If on another tab (Profile, Settings, etc.), go back to Matches
        router.push('/(dashboard)/(tabs)/matches');
        return true; // Prevent default behavior (exiting)
      } else {
        // If already on Matches, exit the app
        BackHandler.exitApp();
        return true;
      }
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [pathname]);

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.white,
        tabBarInactiveTintColor: Colors.textLight,
        headerShown: false,
      }}
      tabBar={props => <CustomTabBar {...props} />}
      sceneContainerStyle={{ backgroundColor: 'transparent' }}
    >
      <Tabs.Screen
        name="(tabs)/matches"
        options={{
          title: 'Matches',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="heart" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="(tabs)/interests"
        options={{
          title: 'Interests',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="users" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="(tabs)/profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="user" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="(tabs)/settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="settings" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="interests/index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="settings/index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="subscription/index"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabBarWrapper: {
    position: 'relative',
  },
  topBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    zIndex: 1,
  },
  gradient: {
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    position: 'relative',
    paddingVertical: 8, // Increased padding
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    zIndex: 2,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 11, // Slightly larger
    fontWeight: '600',
    letterSpacing: 0.2,
    fontFamily: 'SpaceMono',
    textAlign: 'center',
  },
  pillContainer: {
    position: 'absolute',
    left: 8,
    top: 6,
    bottom: 6,
    zIndex: 1,
  },
  pill: {
    flex: 1,
    borderRadius: 16,
  },
});
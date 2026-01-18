import { Stack, SplashScreen } from 'expo-router';
import { SessionProvider } from "../context/SessionContext";
import { View, Text, Dimensions, ActivityIndicator, Image, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import { Colors } from '@/constants/Colors';

const { width } = Dimensions.get('window');

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [fontsLoaded] = useFonts({
    'SpaceMono': require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Prevent the splash screen from auto-hiding
  SplashScreen.preventAutoHideAsync();

  useEffect(() => {
    async function prepare() {
      try {
        // Simulate loading assets
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
        SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  const CustomSplashScreen = () => {
    const shimmerValue = useSharedValue(0);
    const pulseValue = useSharedValue(1);
    const fadeValue = useSharedValue(0);

    useEffect(() => {
      // Initial fade in
      fadeValue.value = withSpring(1, { damping: 10 });

      // Shimmer animation
      shimmerValue.value = withRepeat(
        withSequence(
          withSpring(-1, { duration: 2500 }),
          withSpring(1, { duration: 2500 })
        ),
        -1,
        true
      );

      // Pulse animation
      pulseValue.value = withRepeat(
        withSequence(
          withSpring(1, { duration: 2000 }),
          withSpring(1.05, { duration: 2000 })
        ),
        -1,
        true
      );
    }, []);

    const shimmerStyle = useAnimatedStyle(() => {
      const translateX = interpolate(
        shimmerValue.value,
        [-1, 1],
        [-width, width]
      );

      return {
        transform: [{ translateX }],
      };
    });

    const pulseStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: pulseValue.value }],
      };
    });

    const fadeStyle = useAnimatedStyle(() => {
      return {
        opacity: fadeValue.value,
      };
    });

    // Mali Bandhan gradient colors
    const gradientColors: string[] = [Colors.lotus, Colors.secondaryLight, Colors.primaryLight];

    return (
      <Animated.View style={[fadeStyle, { flex: 1 }]}>
        <ImageBackground
          source={require('../assets/bgmali.png')}
          style={{ flex: 1 }}
          resizeMode="cover"
        >
          <View style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            {/* Transparent background to allow image to show */}
            <View style={{ position: 'absolute', inset: 0, backgroundColor: 'transparent' }} />

            {/* Shimmer effect */}
            <Animated.View
              style={[shimmerStyle, { position: 'absolute', inset: 0, width: '100%', height: '100%' }]}
            >
              <LinearGradient
                colors={['transparent', 'rgba(155, 107, 158, 0.25)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ width: 160, height: '100%' }}
              />
            </Animated.View>

            {/* Glassmorphism overlay */}
            <BlurView
              intensity={25}
              tint="light"
              style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.1)' }}
            />

            {/* Content */}
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Animated.View style={[pulseStyle, { alignItems: 'center' }]}>
                {/* Logo */}
                <View style={{ position: 'relative', marginBottom: 24 }}>
                  <View
                    style={{
                      width: 120,
                      height: 120,
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: Colors.borderLight,
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 16,
                    }}
                  >
                    <Image
                      source={require('../assets/images/logo.png.png')}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="contain"
                    />
                  </View>
                  <View
                    style={{
                      position: 'absolute',
                      top: -8,
                      left: -8,
                      width: 136,
                      height: 136,
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      borderRadius: 20,
                      opacity: 0.5,
                    }}
                  />
                </View>

                {/* App name */}
                <Text
                  style={{
                    fontSize: 40,
                    fontWeight: '700',
                    color: Colors.primary,
                    fontFamily: 'SpaceMono',
                    textAlign: 'center',
                  }}
                >
                  Mali Bandhan
                </Text>
                <Text style={{
                  fontSize: 16,
                  color: Colors.textSecondary,
                  marginTop: 8,
                  fontFamily: 'SpaceMono',
                }}>
                  Finding the Right Match, with Trust
                </Text>

                {/* Loading indicator */}
                <View style={{ marginTop: 32 }}>
                  <ActivityIndicator size="large" color={Colors.primary} />
                </View>
              </Animated.View>
            </View>
          </View>
        </ImageBackground>
      </Animated.View>
    );
  };

  const MaliBandhanHeader = () => {
    return (
      <View>
        {/* Gradient Background */}
        {/* Transparent Background */}
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'transparent' }} />

        {/* Single Line Header */}
        <View style={{
          paddingTop: 48,
          paddingBottom: 16,
          paddingHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}>
          {/* Logo */}
          <View
            style={{
              width: 36,
              height: 36,
              backgroundColor: Colors.white,
              borderRadius: 8,
              alignItems: 'center',
              justifyContent: 'center',
              padding: 5,
              borderWidth: 1,
              borderColor: `${Colors.white}40`,
            }}
          >
            <Image
              source={require('../assets/images/logo.png.png')}
              style={{ width: '100%', height: '100%' }}
              resizeMode="contain"
            />
          </View>

          {/* Name and Tagline */}
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
              <Text style={{
                fontSize: 18,
                fontWeight: '700',
                color: Colors.white,
                fontFamily: 'SpaceMono',
                letterSpacing: -0.3,
              }}>
                Mali Bandhan
              </Text>
              <Text style={{
                fontSize: 11,
                color: `${Colors.white}CC`,
                fontFamily: 'SpaceMono',
                letterSpacing: 0.2,
              }}>
                • Finding the Right Match, with Trust
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom Accent Bar - Lighter gradient */}
        <View style={{ height: 1, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.2)' }} />
      </View>
    );
  };

  if (!appIsReady || !fontsLoaded) {
    return <CustomSplashScreen />;
  }

  return (
    <SessionProvider>
      <ImageBackground
        source={require('../assets/bgmali.png')}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <Stack screenOptions={{
          header: () => <MaliBandhanHeader />,
          headerTransparent: false,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: 'transparent' },
        }}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(dashboard)" />
          <Stack.Screen name="(admin)" options={{ headerShown: false }} />
          <Stack.Screen name="payment-success" options={{ title: 'Payment Success' }} />
          <Stack.Screen name="payment-failure" options={{ title: 'Payment Failed' }} />
        </Stack>
      </ImageBackground>
    </SessionProvider>
  );
}
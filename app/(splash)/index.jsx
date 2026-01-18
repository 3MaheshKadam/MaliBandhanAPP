// import { useEffect } from 'react';
// import { View, Text, Dimensions } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import Animated, { 
//   useSharedValue, 
//   useAnimatedStyle, 
//   withRepeat, 
//   withSequence, 
//   withSpring, 
//   interpolate 
// } from 'react-native-reanimated';

// const { width } = Dimensions.get('window');

// export default function SplashScreen({ navigation }) {
//   const shimmerValue = useSharedValue(0);
//   const pulseValue = useSharedValue(1);

//   useEffect(() => {
//     // Start animations
//     shimmerValue.value = withRepeat(
//       withSequence(
//         withSpring(-1, { duration: 2500 }),
//         withSpring(1, { duration: 2500 })
//       ),
//       -1,
//       true
//     );

//     pulseValue.value = withRepeat(
//       withSequence(
//         withSpring(1, { duration: 2000 }),
//         withSpring(1.03, { duration: 2000 })
//       ),
//       -1,
//       true
//     );

//     // Navigate after delay (simulate loading)
//     const timer = setTimeout(() => {
//       navigation.replace('(auth)'); // Or your initial route
//     }, 3000);

//     return () => clearTimeout(timer);
//   }, []);

//   const shimmerStyle = useAnimatedStyle(() => {
//     const translateX = interpolate(
//       shimmerValue.value,
//       [-1, 1],
//       [-width, width]
//     );

//     return {
//       transform: [{ translateX }],
//     };
//   });

//   const pulseStyle = useAnimatedStyle(() => {
//     return {
//       transform: [{ scale: pulseValue.value }],
//     };
//   });

//   const gradientColors = ['#FF6B6B', '#FF8E99', '#FFB3C1'];

//   return (
//     <View className="flex-1 relative overflow-hidden">
//       {/* Main gradient background */}
//       <LinearGradient
//         colors={gradientColors}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 1 }}
//         className="absolute inset-0"
//       />

//       {/* Shimmer effect */}
//       <Animated.View 
//         style={[shimmerStyle]}
//         className="absolute inset-0 w-full h-full"
//       >
//         <LinearGradient
//           colors={['transparent', 'rgba(255,255,255,0.25)', 'transparent']}
//           start={{ x: 0, y: 0 }}
//           end={{ x: 1, y: 0 }}
//           className="w-40 h-full"
//         />
//       </Animated.View>

//       {/* Content */}
//       <View className="flex-1 items-center justify-center">
//         <Animated.View style={[pulseStyle]}>
//           <Text className="text-5xl font-bold text-white tracking-tight">
//             MaliBandhan
//           </Text>
//           <Text className="text-lg text-center text-white/80 mt-2">
//             Matrimonial Services
//           </Text>
//         </Animated.View>
//       </View>
//     </View>
//   );
// }
import { useEffect } from 'react';
import { View, Text, Image, Dimensions, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withSpring,
  interpolate
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';

const { width } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
  const shimmerValue = useSharedValue(0);
  const pulseValue = useSharedValue(1);
  const fadeValue = useSharedValue(0);

  useEffect(() => {
    // Initial fade in
    fadeValue.value = withSpring(1, { damping: 10 });

    // Start shimmer animation
    shimmerValue.value = withRepeat(
      withSequence(
        withSpring(-1, { duration: 2500 }),
        withSpring(1, { duration: 2500 })
      ),
      -1,
      true
    );

    // Start pulse animation
    pulseValue.value = withRepeat(
      withSequence(
        withSpring(1, { duration: 2000 }),
        withSpring(1.05, { duration: 2000 })
      ),
      -1,
      true
    );

    // Navigate after delay (simulate loading)
    const timer = setTimeout(() => {
      navigation.replace('(auth)'); // Or your initial route
    }, 3000);

    return () => clearTimeout(timer);
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
  const gradientColors = [Colors.lotus, Colors.secondaryLight, Colors.primaryLight];

  return (
    <Animated.View style={[fadeStyle]} className="flex-1">
      <View className="flex-1 relative overflow-hidden">
        {/* Main gradient background */}
        <View
          style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'transparent' }}
        />

        {/* Shimmer effect */}
        <Animated.View
          style={[shimmerStyle]}
          className="absolute inset-0 w-full h-full"
        >
          <LinearGradient
            colors={['transparent', 'rgba(155, 107, 158, 0.25)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="w-40 h-full"
          />
        </Animated.View>

        {/* Glassmorphism overlay */}
        <BlurView
          intensity={25}
          tint="light"
          className="absolute inset-0"
          style={{ backgroundColor: `${Colors.primary}33` }}
        />

        {/* Decorative circles */}
        <View
          className="absolute top-20 left-8 w-32 h-32 rounded-full opacity-20"
          style={{ backgroundColor: Colors.primary }}
        />
        <View
          className="absolute bottom-32 right-8 w-40 h-40 rounded-full opacity-20"
          style={{ backgroundColor: Colors.secondary }}
        />

        {/* Content */}
        <View className="flex-1 items-center justify-center px-6">
          <Animated.View style={[pulseStyle]} className="items-center">
            {/* Logo Container */}
            <View className="relative mb-8">
              <View
                className="w-32 h-32 rounded-2xl items-center justify-center p-4 border"
                style={{
                  backgroundColor: Colors.white,
                  borderColor: Colors.borderLight,
                }}
              >
                <Image
                  source={require('@/assets/images/logo.png.png')}
                  className="w-full h-full"
                  resizeMode="contain"
                />
              </View>

              {/* Glow effect behind logo */}
              <View
                className="absolute -top-2 -left-2 w-36 h-36 rounded-2xl opacity-50"
                style={{ backgroundColor: `${Colors.primaryLight}66` }}
              />
            </View>

            {/* App Name */}
            <Text
              className="text-5xl font-bold tracking-tight text-center"
              style={{ color: Colors.primary, fontFamily: 'SpaceMono' }}
            >
              Mali Bandhan
            </Text>

            {/* Tagline */}
            <Text
              className="text-base text-center mt-3 px-8"
              style={{
                color: Colors.textSecondary,
                fontFamily: 'SpaceMono',
              }}
            >
              Finding the Right Match, with Trust
            </Text>

            {/* Loading Indicator */}
            <View className="mt-10">
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          </Animated.View>

          {/* Trust Indicators */}
          <View className="absolute bottom-16 flex-row items-center justify-center gap-6">
            <View className="flex-row items-center gap-2">
              <View
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: Colors.success }}
              />
              <Text
                className="text-sm"
                style={{
                  color: Colors.textSecondary,
                  fontFamily: 'SpaceMono',
                }}
              >
                Secure
              </Text>
            </View>

            <View className="flex-row items-center gap-2">
              <View
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: Colors.success }}
              />
              <Text
                className="text-sm"
                style={{
                  color: Colors.textSecondary,
                  fontFamily: 'SpaceMono',
                }}
              >
                Trusted by 50,000+
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}
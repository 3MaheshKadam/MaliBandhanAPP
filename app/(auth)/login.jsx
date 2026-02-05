// import React, { useState, useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   KeyboardAvoidingView,
//   Platform,
//   ActivityIndicator,
//   StyleSheet,
// } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { BlurView } from 'expo-blur';
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withTiming,
//   Easing,
// } from 'react-native-reanimated';
// import * as Haptics from 'expo-haptics';
// import { ArrowRight, Phone, Shield, RotateCcw, Edit, ChevronDown } from 'lucide-react-native';
// import { useRouter } from 'expo-router';
// import { useSession } from '@/context/SessionContext';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// export default function MatrimonialLogin() {
//   const router = useRouter();
//   const [step, setStep] = useState(1); // 1: Phone Number, 2: OTP
//   const [phoneNumber, setPhoneNumber] = useState('');
//   const [countryCode, setCountryCode] = useState('+91');
//   const [otp, setOtp] = useState(['', '', '', '', '', '']);
//   const [isLoading, setIsLoading] = useState(false);
//   const [resendTimer, setResendTimer] = useState(0);
//   const [error, setError] = useState('');
//   const [isLoaded, setIsLoaded] = useState(false);
//   const [theme, setTheme] = useState('light');
//   const { login, user } = useSession();
//   const otpInputs = useRef([]);

//   useEffect(() => {
//     const loadTheme = async () => {
//       const savedTheme = await AsyncStorage.getItem('theme');
//       setTheme(savedTheme || 'light');
//     };
//     loadTheme();

//     setIsLoaded(true);
//     if (user) {
//       router.push('/(dashboard)/matches');
//     }
//   }, [user, router]);

//   useEffect(() => {
//     if (resendTimer > 0) {
//       const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
//       return () => clearTimeout(timer);
//     }
//   }, [resendTimer]);

//   const validatePhoneNumber = (phone) => {
//     const phoneRegex = /^[6-9]\d{9}$/;
//     return phoneRegex.test(phone.replace(/\s/g, ''));
//   };

//   const handleSendOTP = () => {
//     setError('');
//     if (!validatePhoneNumber(phoneNumber)) {
//       setError('Please enter a valid 10-digit mobile number');
//       return;
//     }

//     setIsLoading(true);
//     // Simulate sending OTP (static, no API)
//     setStep(2);
//     setResendTimer(30);
//     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//     setIsLoading(false);
//   };

//   const handleOTPChange = (index, value) => {
//     if (value.length > 1) return;
//     const newOtp = [...otp];
//     newOtp[index] = value;
//     setOtp(newOtp);

//     if (value && index < 5) {
//       otpInputs.current[index + 1].focus();
//     } else if (!value && index > 0) {
//       otpInputs.current[index - 1].focus();
//     }
//   };

//   const handleVerifyOTP = async () => {
//     const otpString = otp.join('');
//     if (otpString.length !== 6) {
//       setError('Please enter complete 6-digit OTP');
//       return;
//     }

//     setIsLoading(true);
//     setError('');
//     // Static OTP verification
//     if (otpString === '123456') {
//       const cleanedPhone = phoneNumber.replace(/\s/g, '');
//       await login(cleanedPhone); // Use phone as userId
//       Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
//     } else {
//       setError('Invalid OTP');
//     }
//     setIsLoading(false);
//   };

//   const handleResendOTP = () => {
//     setOtp(['', '', '', '', '', '']);
//     setError('');
//     setResendTimer(30);
//     // Simulate resending OTP (static, no API)
//     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//   };

//   const formatPhoneDisplay = (phone) => {
//     return phone.replace(/(\d{5})(\d{5})/, '$1 $2');
//   };

//   const buttonScale = useSharedValue(1);
//   const buttonStyle = useAnimatedStyle(() => ({
//     transform: [{ scale: buttonScale.value }],
//   }));

//   const handlePressIn = () => {
//     buttonScale.value = withTiming(0.95, { duration: 100 });
//   };

//   const handlePressOut = () => {
//     buttonScale.value = withTiming(1, { duration: 100 });
//   };

//   if (user && isLoaded) {
//     return null;
//   }

//   const gradientColors = theme === 'light'
//     ? ['#FFE4E6', '#FCA5A5', '#FCD34D']
//     : ['#1E3A8A', '#4B5EAA', '#FCD34D'];

//   return (
//     <LinearGradient colors={gradientColors} style={styles.container}>
//       <View style={styles.decorativeLeft} />
//       <View style={styles.decorativeRight} />
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         style={styles.keyboardView}
//       >
//         <ScrollView
//           contentContainerStyle={styles.scrollContent}
//           keyboardShouldPersistTaps="handled"
//         >
//           <BlurView intensity={30} tint={theme} style={styles.card}>
//             <View style={styles.header}>
//               <View style={styles.logoContainer}>
//                 <Text style={styles.logoEmoji}>💕</Text>
//               </View>
//               <Text style={styles.title}>Welcome Back</Text>
//               <Text style={styles.subtitle}>Find Your Perfect Match</Text>
//             </View>

//             <View style={styles.content}>
//               {step === 1 ? (
//                 <View style={styles.form}>
//                   <View style={styles.inputGroup}>

//                     <View style={styles.phoneInputContainer}>
//                       <View style={styles.countryCode}>
//                         <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
//                         <ChevronDown size={16} color="#6B7280" />
//                       </View>
//                       <TextInput
//                         style={styles.input}
//                         value={phoneNumber}
//                         onChangeText={setPhoneNumber}
//                         placeholder="98765 43210"
//                         placeholderTextColor="#9CA3AF"
//                         keyboardType="phone-pad"
//                         maxLength={10}
//                       />
//                     </View>
//                   </View>

//                   {error && (
//                     <View style={styles.errorContainer}>
//                       <Text style={styles.errorText}>{error}</Text>
//                     </View>
//                   )}

//                   <Animated.View style={buttonStyle}>
//                     <TouchableOpacity
//                       style={styles.button}
//                       onPress={handleSendOTP}
//                       onPressIn={handlePressIn}
//                       onPressOut={handlePressOut}
//                       disabled={isLoading}
//                     >
//                       <LinearGradient
//                         colors={['#FF2D55', '#FF6B81']}
//                         style={styles.buttonGradient}
//                       >
//                         {isLoading ? (
//                           <ActivityIndicator color="#FFFFFF" />
//                         ) : (
//                           <View style={styles.buttonContent}>
//                             <Text style={styles.buttonText}>Send OTP</Text>
//                             <ArrowRight size={16} color="#FFFFFF" />
//                           </View>
//                         )}
//                       </LinearGradient>
//                     </TouchableOpacity>
//                   </Animated.View>
//                 </View>
//               ) : (
//                 <View style={styles.form}>
//                   <View style={styles.otpHeader}>
//                     <View style={styles.shieldContainer}>
//                       <Shield size={20} color="#059669" />
//                     </View>
//                     <Text style={styles.otpTitle}>Verify OTP</Text>
//                     <Text style={styles.otpSubtitle}>
//                       OTP sent to {countryCode} {formatPhoneDisplay(phoneNumber)}
//                     </Text>
//                   </View>

//                   <View style={styles.otpInputGroup}>
//                     <Text style={styles.otpLabel}>Enter 6-digit OTP</Text>
//                     <View style={styles.otpInputs}>
//                       {otp.map((digit, index) => (
//                         <TextInput
//                           key={index}
//                           ref={(ref) => (otpInputs.current[index] = ref)}
//                           style={styles.otpInput}
//                           value={digit}
//                           onChangeText={(value) => handleOTPChange(index, value)}
//                           keyboardType="number-pad"
//                           maxLength={1}
//                           textAlign="center"
//                         />
//                       ))}
//                     </View>
//                   </View>

//                   {error && (
//                     <View style={styles.errorContainer}>
//                       <Text style={styles.errorText}>{error}</Text>
//                     </View>
//                   )}

//                   <Animated.View style={buttonStyle}>
//                     <TouchableOpacity
//                       style={styles.button}
//                       onPress={handleVerifyOTP}
//                       onPressIn={handlePressIn}
//                       onPressOut={handlePressOut}
//                       disabled={isLoading}
//                     >
//                       <LinearGradient
//                         colors={['#FF2D55', '#FF6B81']}
//                         style={styles.buttonGradient}
//                       >
//                         {isLoading ? (
//                           <ActivityIndicator color="#FFFFFF" />
//                         ) : (
//                           <View style={styles.buttonContent}>
//                             <Text style={styles.buttonText}>Verify OTP</Text>
//                             <ArrowRight size={16} color="#FFFFFF" />
//                           </View>
//                         )}
//                       </LinearGradient>
//                     </TouchableOpacity>
//                   </Animated.View>

//                   <View style={styles.otpActions}>
//                     <TouchableOpacity
//                       style={styles.actionButton}
//                       onPress={handleResendOTP}
//                       disabled={resendTimer > 0}
//                     >
//                       <RotateCcw
//                         size={16}
//                         color={resendTimer > 0 ? '#9CA3AF' : '#FF2D55'}
//                         style={styles.actionIcon}
//                       />
//                       <Text
//                         style={[
//                           styles.actionText,
//                           { color: resendTimer > 0 ? '#9CA3AF' : '#FF2D55' },
//                         ]}
//                       >
//                         {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
//                       </Text>
//                     </TouchableOpacity>
//                     <TouchableOpacity
//                       style={styles.actionButton}
//                       onPress={() => {
//                         setStep(1);
//                         setOtp(['', '', '', '', '', '']);
//                         setError('');
//                         Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//                       }}
//                     >
//                       <Edit size={16} color="#6B7280" style={styles.actionIcon} />
//                       <Text style={[styles.actionText, { color: '#6B7280' }]}>
//                         Change Number
//                       </Text>
//                     </TouchableOpacity>
//                   </View>
//                 </View>
//               )}
//             </View>
//           </BlurView>

//           <View style={styles.trustIndicators}>
//             <View style={styles.trustItem}>
//               <View style={styles.trustDot} />
//               <Text style={styles.trustText}>Secure Login</Text>
//             </View>
//             <View style={styles.trustItem}>
//               <View style={styles.trustDot} />
//               <Text style={styles.trustText}>Trusted by 10,000+</Text>
//             </View>
//           </View>
//         </ScrollView>
//       </KeyboardAvoidingView>
//     </LinearGradient>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   decorativeLeft: {
//     position: 'absolute',
//     top: 40,
//     left: 16,
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     backgroundColor: 'rgba(251, 113, 133, 0.2)',
//     opacity: 0.3,
//   },
//   decorativeRight: {
//     position: 'absolute',
//     bottom: 40,
//     right: 16,
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//     backgroundColor: 'rgba(252, 211, 77, 0.2)',
//     opacity: 0.3,
//   },
//   keyboardView: {
//     flex: 1,
//   },
//   scrollContent: {
//     flexGrow: 1,
//     padding: 20,
//     justifyContent: 'center',
//   },
//   card: {
//     backgroundColor: '#FF2D55',
//     borderRadius: 12,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 16,
//     transform: [{ rotate: '3deg' }],
//   },
//   logoEmoji: {
//     fontSize: 28,
//     color: '#FFFFFF',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: '600',
//     color: '#1F2937',
//     fontFamily: 'SpaceMono',
//     letterSpacing: 0.5,
//   },
//   subtitle: {
//     fontSize: 16,
//     color: '#6B7280',
//     fontFamily: 'SpaceMono',
//     letterSpacing: 0.3,
//   },
//   content: {
//     paddingHorizontal: 24,
//     paddingBottom: 32,
//   },
//   form: {
//     gap: 24,
//   },
//   inputGroup: {
//     gap: 8,
//   },
//   label: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#374151',
//     fontFamily: 'SpaceMono',
//     letterSpacing: 0.5,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   labelIcon: {
//     marginRight: 8,
//   },
//   phoneInputContainer: {
//     flexDirection: 'row',
//     gap: 12,
//   },
//   countryCode: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 14,
//     borderRadius: 12,
//     backgroundColor: '#FFFFFF',
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//   },
//   countryCodeText: {
//     fontSize: 16,
//     color: '#1F2937',
//     marginRight: 8,
//     fontFamily: 'SpaceMono',
//   },
//   input: {
//     flex: 1,
//     padding: 14,
//     borderRadius: 12,
//     backgroundColor: '#FFFFFF',
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//     fontSize: 16,
//     fontFamily: 'SpaceMono',
//     color: '#1F2937',
//   },
//   otpHeader: {
//     alignItems: 'center',
//     gap: 12,
//   },
//   shieldContainer: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: '#D1FAE5',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   otpTitle: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: '#1F2937',
//     fontFamily: 'SpaceMono',
//     letterSpacing: 0.5,
//   },
//   otpSubtitle: {
//     fontSize: 14,
//     color: '#6B7280',
//     fontFamily: 'SpaceMono',
//     letterSpacing: 0.3,
//   },
//   otpInputGroup: {
//     gap: 8,
//     alignItems: 'center',
//   },
//   otpLabel: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#374151',
//     fontFamily: 'SpaceMono',
//     letterSpacing: 0.5,
//   },
//   otpInputs: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     gap: 8,
//   },
//   otpInput: {
//     width: 48,
//     height: 48,
//     borderRadius: 10,
//     backgroundColor: '#FFFFFF',
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//     fontSize: 18,
//     fontWeight: '600',
//     fontFamily: 'SpaceMono',
//     color: '#1F2937',
//   },
//   errorContainer: {
//     backgroundColor: '#FEF2F2',
//     padding: 12,
//     borderRadius: 10,
//     borderWidth: 1,
//   },
//   errorText: {
//     fontSize: 13,
//     color: '#DC2626',
//     fontFamily: 'SpaceMono',
//     letterSpacing: 0.3,
//   },
//   button: {
//     borderRadius: 12,
//     overflow: 'hidden',
//   },
//   buttonGradient: {
//     padding: 16,
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   buttonContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   buttonText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#FFFFFF',
//     fontFamily: 'SpaceMono',
//     letterSpacing: 0.5,
//   },
//   otpActions: {
//     gap: 12,
//     paddingTop: 12,
//     alignItems: 'center',
//   },
//   actionButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//   },
//   actionIcon: {
//     marginRight: 4,
//   },
//   actionText: {
//     fontSize: 13,
//     fontWeight: '500',
//     fontFamily: 'SpaceMono',
//     letterSpacing: 0.3,
//   },
//   trustIndicators: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     gap: 16,
//     marginTop: 24,
//   },
//   trustItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//   },
//   trustDot: {
//     width: 6,
//     height: 6,
//     borderRadius: 3,
//     backgroundColor: '#10B981',
//   },
//   trustText: {
//     fontSize: 12,
//     color: '#6B7280',
//     fontFamily: 'SpaceMono',
//     letterSpacing: 0.3,
//   },
// });
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ArrowRight, Phone, Shield, RotateCcw, Edit, ArrowDown } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSession } from '@/context/SessionContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/Colors';

export default function MaliBandhanLogin() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Phone Number, 2: OTP
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [error, setError] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [theme, setTheme] = useState('light');
  const { login, user } = useSession();
  const otpInputs = useRef([]);

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem('theme');
      setTheme(savedTheme || 'light');
    };
    loadTheme();

    setIsLoaded(true);
    if (user) {
      router.push('/(dashboard)/matches');
    }
  }, [user, router]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Auto-focus OTP when step determines to 2
  useEffect(() => {
    if (step === 2) {
      setTimeout(() => {
        otpInputs.current[0]?.focus();
      }, 500); // Small delay to let animation finish
    }
  }, [step]);

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const handleSendOTP = () => {
    setError('');
    if (!validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsLoading(true);
    // Simulate sending OTP (static, no API)
    setStep(2);
    setResendTimer(30);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsLoading(false);
  };

  const handleOTPChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpInputs.current[index + 1].focus();
    } else if (!value && index > 0) {
      otpInputs.current[index - 1].focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter complete 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');
    // Static OTP verification
    if (otpString === '123456') {
      const cleanedPhone = phoneNumber.replace(/\s/g, '');
      const fullPhoneNumber = `${countryCode}${cleanedPhone}`;
      const success = await login(fullPhoneNumber); // Use phone with country code as userId

      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setError('Login failed. Please check your internet connection.');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } else {
      setError('Invalid OTP');
    }
    setIsLoading(false);
  };

  const handleResendOTP = () => {
    setOtp(['', '', '', '', '', '']);
    setError('');
    setResendTimer(30);
    // Simulate resending OTP (static, no API)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const formatPhoneDisplay = (phone) => {
    return phone.replace(/(\d{5})(\d{5})/, '$1 $2');
  };

  const buttonScale = useSharedValue(1);
  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handlePressIn = () => {
    buttonScale.value = withTiming(0.95, { duration: 100 });
  };

  const handlePressOut = () => {
    buttonScale.value = withTiming(1, { duration: 100 });
  };

  if (user && isLoaded) {
    return null;
  }

  const gradientColors = theme === 'light'
    ? [Colors.lotus, Colors.secondaryLight, Colors.primaryLight]
    : [Colors.primaryDark, Colors.primary, Colors.secondaryLight];

  return (
    <View style={styles.container}>
      <View style={[styles.decorativeLeft, { backgroundColor: `${Colors.primary}33` }]} />
      <View style={[styles.decorativeRight, { backgroundColor: `${Colors.secondary}33` }]} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <BlurView intensity={30} tint={theme} style={styles.card}>
            <View style={styles.header}>
              <View style={[styles.logoContainer, { backgroundColor: Colors.primary }]}>
                <Image
                  source={require('@/assets/images/logo.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={[styles.title, { color: Colors.textPrimary }]}>
                Welcome to Mali Bandhan
              </Text>
              <Text style={[styles.subtitle, { color: Colors.textSecondary }]}>
                Finding the Right Match, with Trust
              </Text>
            </View>

            <View style={styles.content}>
              {step === 1 ? (
                <View style={styles.form}>
                  <View style={styles.inputGroup}>
                    <View style={styles.phoneInputContainer}>
                      <View style={[styles.countryCode, { borderColor: '#475569' }]}>
                        <Text style={[styles.countryCodeText, { color: Colors.textPrimary }]}>
                          🇮🇳 +91
                        </Text>
                        <ArrowDown size={16} color={Colors.textSecondary} />
                      </View>
                      <TextInput
                        style={[styles.input, {
                          borderColor: '#475569',
                          color: Colors.textPrimary
                        }]}
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        placeholder="98765 43210"
                        placeholderTextColor={Colors.textLight}
                        keyboardType="phone-pad"
                        maxLength={10}
                      />
                    </View>
                  </View>

                  {error && (
                    <View style={[styles.errorContainer, {
                      backgroundColor: Colors.lightDanger,
                      borderColor: Colors.danger
                    }]}>
                      <Text style={[styles.errorText, { color: Colors.danger }]}>
                        {error}
                      </Text>
                    </View>
                  )}

                  <Animated.View style={buttonStyle}>
                    <TouchableOpacity
                      style={styles.button}
                      onPress={handleSendOTP}
                      onPressIn={handlePressIn}
                      onPressOut={handlePressOut}
                      disabled={isLoading}
                    >
                      <LinearGradient
                        colors={[Colors.primary, Colors.primaryLight]}
                        style={styles.buttonGradient}
                      >
                        {isLoading ? (
                          <ActivityIndicator color={Colors.white} />
                        ) : (
                          <View style={styles.buttonContent}>
                            <Text style={[styles.buttonText, { color: Colors.white }]}>
                              Send OTP
                            </Text>
                            <ArrowRight size={16} color={Colors.white} />
                          </View>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  </Animated.View>
                </View>
              ) : (
                <View style={styles.form}>
                  <View style={styles.otpHeader}>
                    <View style={[styles.shieldContainer, { backgroundColor: Colors.lightSuccess }]}>
                      <Shield size={20} color={Colors.success} />
                    </View>
                    <Text style={[styles.otpTitle, { color: Colors.textPrimary }]}>
                      Verify OTP
                    </Text>
                    <Text style={[styles.otpSubtitle, { color: Colors.textSecondary }]}>
                      OTP sent to {countryCode} {formatPhoneDisplay(phoneNumber)}
                    </Text>
                  </View>

                  <View style={styles.otpInputGroup}>
                    <Text style={[styles.otpLabel, { color: Colors.textPrimary }]}>
                      Enter 6-digit OTP
                    </Text>
                    <View style={styles.otpInputs}>
                      {otp.map((digit, index) => (
                        <TextInput
                          key={index}
                          ref={(ref) => (otpInputs.current[index] = ref)}
                          style={[styles.otpInput, {
                            borderColor: digit ? Colors.primary : '#475569',
                            color: Colors.textPrimary,
                            backgroundColor: digit ? Colors.secondaryLight : Colors.white
                          }]}
                          value={digit}
                          onChangeText={(value) => handleOTPChange(index, value)}
                          keyboardType="number-pad"
                          maxLength={1}
                          textAlign="center"
                        />
                      ))}
                    </View>
                  </View>

                  {error && (
                    <View style={[styles.errorContainer, {
                      backgroundColor: Colors.lightDanger,
                      borderColor: Colors.danger
                    }]}>
                      <Text style={[styles.errorText, { color: Colors.danger }]}>
                        {error}
                      </Text>
                    </View>
                  )}

                  <Animated.View style={buttonStyle}>
                    <TouchableOpacity
                      style={styles.button}
                      onPress={handleVerifyOTP}
                      onPressIn={handlePressIn}
                      onPressOut={handlePressOut}
                      disabled={isLoading}
                    >
                      <LinearGradient
                        colors={[Colors.primary, Colors.primaryLight]}
                        style={styles.buttonGradient}
                      >
                        {isLoading ? (
                          <ActivityIndicator color={Colors.white} />
                        ) : (
                          <View style={styles.buttonContent}>
                            <Text style={[styles.buttonText, { color: Colors.white }]}>
                              Verify OTP
                            </Text>
                            <ArrowRight size={16} color={Colors.white} />
                          </View>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  </Animated.View>

                  <View style={styles.otpActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={handleResendOTP}
                      disabled={resendTimer > 0}
                    >
                      <RotateCcw
                        size={16}
                        color={resendTimer > 0 ? Colors.textLight : Colors.primary}
                        style={styles.actionIcon}
                      />
                      <Text
                        style={[
                          styles.actionText,
                          { color: resendTimer > 0 ? Colors.textLight : Colors.primary },
                        ]}
                      >
                        {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => {
                        setStep(1);
                        setOtp(['', '', '', '', '', '']);
                        setError('');
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                    >
                      <Edit size={16} color={Colors.textSecondary} style={styles.actionIcon} />
                      <Text style={[styles.actionText, { color: Colors.textSecondary }]}>
                        Change Number
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </BlurView>

          <View style={styles.trustIndicators}>
            <View style={styles.trustItem}>
              <View style={[styles.trustDot, { backgroundColor: Colors.success }]} />
              <Text style={[styles.trustText, { color: Colors.textSecondary }]}>
                Secure Login
              </Text>
            </View>
            <View style={styles.trustItem}>
              <View style={[styles.trustDot, { backgroundColor: Colors.success }]} />
              <Text style={[styles.trustText, { color: Colors.textSecondary }]}>
                Trusted by 50,000+
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  decorativeLeft: {
    position: 'absolute',
    top: 40,
    left: 16,
    width: 80,
    height: 80,
    borderRadius: 40,
    opacity: 0.3,
  },
  decorativeRight: {
    position: 'absolute',
    bottom: 40,
    right: 16,
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.3,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#CBD5E1', // Added darker border to card
  },
  header: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'SpaceMono',
    letterSpacing: 0.5,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'SpaceMono',
    letterSpacing: 0.3,
    marginTop: 4,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 1,
  },
  countryCodeText: {
    fontSize: 16,
    marginRight: 8,
    fontFamily: 'SpaceMono',
  },
  input: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 1,
    fontSize: 16,
    fontFamily: 'SpaceMono',
  },
  otpHeader: {
    alignItems: 'center',
    gap: 12,
  },
  shieldContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'SpaceMono',
    letterSpacing: 0.5,
  },
  otpSubtitle: {
    fontSize: 14,
    fontFamily: 'SpaceMono',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  otpInputGroup: {
    gap: 8,
    alignItems: 'center',
  },
  otpLabel: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'SpaceMono',
    letterSpacing: 0.5,
  },
  otpInputs: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  otpInput: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'SpaceMono',
  },
  errorContainer: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 13,
    fontFamily: 'SpaceMono',
    letterSpacing: 0.3,
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'SpaceMono',
    letterSpacing: 0.5,
  },
  otpActions: {
    gap: 12,
    paddingTop: 12,
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionIcon: {
    marginRight: 4,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'SpaceMono',
    letterSpacing: 0.3,
  },
  trustIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 24,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trustDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  trustText: {
    fontSize: 12,
    fontFamily: 'SpaceMono',
    letterSpacing: 0.3,
  },
});
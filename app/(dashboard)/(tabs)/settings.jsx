import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Animated,
  Easing,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Crown,
  Check,
  Star,
  Gift,
  AlertCircle,
  LogOut,
  ArrowDown,
  ChevronUp,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useSession } from '../../../context/SessionContext';
import { Config } from '@/constants/Config';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const PlanCard = ({ plan, isCurrentPlan, isDowngrade, isButtonLoading, config, onSubscribe }) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
    Haptics.selectionAsync();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const formatPrice = (price) => {
    if (price === 0 || price === '0') return '0';
    return price?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ',') || '0';
  };

  const getDurationText = (duration) => {
    if (duration === 30) return 'month';
    if (duration === 60) return '2 months';
    if (duration === 90) return '3 months';
    if (duration === 180) return '6 months';
    if (duration === 365) return '12 months';
    return `${duration} days`;
  };

  const IconComponent = config.icon;

  const getButtonText = () => {
    if (isButtonLoading) return '';
    if (isCurrentPlan) return '🎉 Currently Active';
    if (isDowngrade) return 'Downgrade';
    return 'Subscribe Now';
  };

  const isButtonDisabled = !plan.isActive || isButtonLoading || isCurrentPlan || isDowngrade;

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        marginBottom: 16,
      }}
    >
      <View
        style={{
          backgroundColor: Colors.white,
          borderRadius: 16,
          padding: 20,
          borderWidth: 1,
          borderColor: Colors.borderLight,
          opacity: plan.isActive ? 1 : 0.7,
        }}
      >
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: config.bgColor,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 8,
            }}
          >
            <IconComponent size={32} color={config.textColor} />
          </View>
          <Text style={{ fontSize: 22, fontWeight: '800', color: Colors.textPrimary, marginBottom: 4, fontFamily: 'SpaceMono' }}>
            {config.emoji} {plan.name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 32, fontWeight: '800', color: config.textColor, fontFamily: 'SpaceMono' }}>
              ₹{formatPrice(plan.price)}
            </Text>
            <Text style={{ fontSize: 16, color: Colors.textSecondary, marginLeft: 4, fontFamily: 'SpaceMono', fontWeight: '600' }}>
              /{getDurationText(plan.durationInDays)}
            </Text>
          </View>
        </View>
        <View style={{ marginBottom: 16 }}>
          {plan.features?.map((feature, idx) => (
            <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: config.bgColor,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 8,
                }}
              >
                <Check size={16} color={config.textColor} />
              </View>
              <Text style={{ fontSize: 16, color: Colors.textPrimary, fontWeight: '600', fontFamily: 'SpaceMono', flex: 1 }}>{feature}</Text>
            </View>
          ))}
        </View>
        <View style={{ marginBottom: 12, alignItems: 'center' }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 12,
              backgroundColor: plan.isActive ? Colors.lightSuccess : Colors.lightDanger,
            }}
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: plan.isActive ? Colors.success : Colors.danger,
                marginRight: 6,
              }}
            />
            <Text style={{ fontSize: 13, color: plan.isActive ? Colors.success : Colors.danger, fontWeight: '600', fontFamily: 'SpaceMono' }}>
              {plan.isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => onSubscribe(plan)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={isButtonDisabled}
          style={{
            backgroundColor: isCurrentPlan ? Colors.success : (isDowngrade ? Colors.border : config.bgColor),
            padding: 16,
            borderRadius: 12,
            alignItems: 'center',
            opacity: isButtonDisabled ? 0.6 : 1,
            marginTop: 12
          }}
        >
          {isButtonLoading ? (
            <ActivityIndicator color={config.textColor} />
          ) : (
            <Text style={{ color: isDowngrade ? Colors.textSecondary : config.textColor, fontWeight: '700', fontSize: 18, fontFamily: 'SpaceMono' }}>
              {getButtonText()}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const FAQItem = ({ question, answer, isExpanded, onToggle }) => {
  const rotateAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: isExpanded ? 1 : 0,
      duration: 200,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, [isExpanded]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={{ marginBottom: 12, borderBottomWidth: 1, borderBottomColor: Colors.borderLight }}>
      <TouchableOpacity
        onPress={onToggle}
        style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 }}
      >
        <Text style={{ fontSize: 16, fontWeight: '600', color: Colors.textPrimary, flex: 1, fontFamily: 'SpaceMono' }}>{question}</Text>
        <Animated.View style={{ transform: [{ rotate }] }}>
          {isExpanded ? <ChevronUp size={20} color={Colors.primary} /> : <ArrowDown size={20} color={Colors.primary} />}
        </Animated.View>
      </TouchableOpacity>
      {isExpanded && (
        <Animated.View style={{ paddingBottom: 12, opacity: rotateAnim }}>
          <Text style={{ fontSize: 14, color: Colors.textSecondary, lineHeight: 20, fontFamily: 'SpaceMono' }}>{answer}</Text>
        </Animated.View>
      )}
    </View>
  );
};

export default function SettingsPage() {
  const { user, logout } = useSession();
  const router = useRouter();
  const [plans, setPlans] = useState([]);
  const [freePlan, setFreePlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [activeButtonId, setActiveButtonId] = useState(null);
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const insets = useSafeAreaInsets();

  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch(`${Config.API_URL}/api/users/${user?.id}`, {
          credentials: 'include',
        });
        const data = await res.json();
        setCurrentSubscription({
          subscriptionId: data.subscription?.subscriptionId,
          plan: data.subscription?.plan,
        });
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };

    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${Config.API_URL}/api/subscription`, {
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Failed to fetch subscription plans');
        }
        const data = await response.json();

        const freePlan = data.find(
          (plan) =>
            plan.price === 0 ||
            plan.price === '0' ||
            plan.name?.toLowerCase().includes('free')
        );

        const paidPlans = data.filter((plan) => plan !== freePlan);

        setFreePlan(freePlan || null);
        setPlans(paidPlans);

        if (user?.subscription) {
          setCurrentSubscription(user.subscription);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
        setIsLoaded(true);
      }
    };

    fetchUserData();
    fetchPlans();
  }, [user]);

  const handleSubscription = async (plan) => {
    try {
      setActiveButtonId(plan._id);
      setIsSubscribing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const res = await fetch(`${Config.API_URL}/api/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: plan.price * 100,
          userId: user?.id,
          planId: plan._id,
          currentSubscriptionId: currentSubscription?.subscriptionId || null,
        }),
      });

      const order = await res.json();

      // In a real app, you would use a WebView or external browser for Razorpay checkout
      // For simplicity, simulate payment completion and update subscription
      const updateRes = await fetch(`${Config.API_URL}/api/users/update-plan`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          plan: plan.name,
          planId: plan._id,
          currentSubscriptionId: currentSubscription?.subscriptionId || null,
          razorpay_payment_id: `simulated_payment_${Date.now()}`,
        }),
      });

      const updateResult = await updateRes.json();
      if (updateRes.ok) {
        setCurrentSubscription({
          subscriptionId: plan._id,
          plan: plan.name,
        });
        router.push('/payment-success');
      } else {
        throw new Error(updateResult.message || 'Failed to update subscription');
      }
    } catch (err) {
      console.error('Error in handleSubscription:', err);
      Alert.alert('Error', err.message || 'Something went wrong. Please try again.');
    } finally {
      setActiveButtonId(null);
      setIsSubscribing(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/login');
            } catch (err) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };


  const getPlanConfig = (planName) => {
    const configs = {
      Gold: {
        icon: Crown,
        color: [Colors.warning, '#F59E0B'],
        bgColor: Colors.lightWarning,
        textColor: Colors.warning,
        badgeColor: Colors.warning,
        emoji: '👑',
      },
      Premium: {
        icon: Crown,
        color: [Colors.primary, Colors.primaryLight],
        bgColor: Colors.secondaryLight,
        textColor: Colors.primary,
        badgeColor: Colors.primary,
        emoji: '💎',
      },
      Free: {
        icon: Gift,
        color: [Colors.textLight, Colors.textSecondary],
        bgColor: Colors.backgroundTertiary,
        textColor: Colors.textSecondary,
        badgeColor: Colors.textLight,
        emoji: '🆓',
      },
    };

    if (!planName) return configs['Premium'];
    if (planName.toLowerCase().includes('gold')) return configs['Gold'];
    if (planName.toLowerCase().includes('premium')) return configs['Premium'];
    if (planName.toLowerCase().includes('free')) return configs['Free'];
    return configs['Premium'];
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.white }}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ color: Colors.textPrimary, fontSize: 16, marginTop: 16, fontFamily: 'SpaceMono' }}>
          Loading Subscription Plans
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.white }}>
        <AlertCircle size={48} color={Colors.danger} style={{ marginBottom: 16 }} />
        <Text style={{ fontSize: 20, fontWeight: '600', color: Colors.textPrimary, marginBottom: 8, fontFamily: 'SpaceMono' }}>
          Error Loading Plans
        </Text>
        <Text style={{ fontSize: 14, color: Colors.textSecondary, textAlign: 'center', fontFamily: 'SpaceMono' }}>{error}</Text>
      </View>
    );
  }

  return (
    <View
      style={{ flex: 1, backgroundColor: 'transparent' }}
    >
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}>
        <Animated.View style={{ opacity: fadeAnim, padding: 20 }}>
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: Colors.secondaryLight,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
              }}
            >
              <Crown size={40} color={Colors.primary} />
            </View>
            <Text style={{ fontSize: 24, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8, fontFamily: 'SpaceMono' }}>
              Subscription Plans
            </Text>
            <Text style={{ fontSize: 16, color: Colors.textSecondary, textAlign: 'center', maxWidth: 300, fontFamily: 'SpaceMono' }}>
              Unlock premium features and find your perfect match faster with our subscription plans
            </Text>
          </View>

          {freePlan && (
            <PlanCard
              plan={freePlan}
              isCurrentPlan={currentSubscription?.subscriptionId === freePlan._id}
              isButtonLoading={isSubscribing && activeButtonId === freePlan._id}
              config={getPlanConfig(freePlan.name)}
              onSubscribe={() => { }}
            />
          )}

          {plans.map((plan) => {
            const activePlan = plans.find(p => p._id === currentSubscription?.subscriptionId) || (currentSubscription?.subscriptionId === freePlan?._id ? freePlan : null);
            const isActive = currentSubscription?.subscriptionId === plan._id;
            const isDowngrade = activePlan && Number(plan.price) < Number(activePlan.price);

            return (
              <PlanCard
                key={plan._id}
                plan={plan}
                isCurrentPlan={isActive}
                isDowngrade={isDowngrade}
                isButtonLoading={isSubscribing && activeButtonId === plan._id}
                config={getPlanConfig(plan.name)}
                onSubscribe={handleSubscription}
              />
            );
          })}

          <View
            style={{
              backgroundColor: Colors.white,
              borderRadius: 16,
              padding: 20,
              marginTop: 20,
              borderWidth: 1,
              borderColor: Colors.borderLight,
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginBottom: 16, textAlign: 'center', fontFamily: 'SpaceMono' }}>
              Settings
            </Text>
            <TouchableOpacity
              onPress={handleLogout}
              style={{
                backgroundColor: Colors.lightDanger,
                padding: 16,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LogOut size={20} color={Colors.danger} style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 16, fontWeight: '600', color: Colors.danger, fontFamily: 'SpaceMono' }}>
                Logout
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={{
              backgroundColor: Colors.white,
              borderRadius: 16,
              padding: 20,
              marginTop: 20,
              borderWidth: 1,
              borderColor: Colors.borderLight,
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginBottom: 16, textAlign: 'center', fontFamily: 'SpaceMono' }}>
              Frequently Asked Questions
            </Text>
            <FAQItem
              question="Can I change my subscription plan?"
              answer="Yes! When you subscribe to a new plan, your current subscription will be automatically replaced."
              isExpanded={expandedFAQ === 'change_plan'}
              onToggle={() => setExpandedFAQ(expandedFAQ === 'change_plan' ? null : 'change_plan')}
            />
            <FAQItem
              question="Is my payment information secure?"
              answer="Absolutely! We use industry-standard encryption and work with trusted payment providers."
              isExpanded={expandedFAQ === 'payment_secure'}
              onToggle={() => setExpandedFAQ(expandedFAQ === 'payment_secure' ? null : 'payment_secure')}
            />
            <FAQItem
              question="What happens when I change plans?"
              answer="Your new plan will take effect immediately, replacing your current subscription."
              isExpanded={expandedFAQ === 'change_effect'}
              onToggle={() => setExpandedFAQ(expandedFAQ === 'change_effect' ? null : 'change_effect')}
            />
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
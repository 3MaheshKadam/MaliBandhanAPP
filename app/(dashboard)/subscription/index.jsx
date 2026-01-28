import { View, Text, Pressable, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Colors } from '../../../constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Crown,
  Check,
  X,
  Star,
  Heart,
  Eye,
  Sparkles,
  Shield,
  Zap,
  Gift,
  Phone
} from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { useState, useEffect } from 'react';
import { useSession } from '../../../context/SessionContext';
import { Config } from '../../../constants/Config';

export default function Subscription() {
  const { user } = useSession();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSubscription, setCurrentSubscription] = useState(null);

  useEffect(() => {
    fetchPlans();
    if (user?.subscription) {
      setCurrentSubscription(user.subscription);
    }
  }, [user]);

  const fetchPlans = async () => {
    try {
      const response = await fetch(`${Config.API_URL}/api/subscription`);
      const data = await response.json();

      if (response.ok) {
        // Sort plans: Free first, then by price
        const sortedPlans = data.sort((a, b) => a.price - b.price);
        setPlans(sortedPlans);
      } else {
        console.error('Failed to fetch plans:', data);
        Alert.alert('Error', 'Failed to load subscription plans');
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      Alert.alert('Error', 'Currently unable to load plans. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = (plan) => {
    if (currentSubscription?.plan === plan.name) {
      return;
    }
    console.log('Subscribe to:', plan.name);
    // Future Phase: Redirect to Payment Gateway
    Alert.alert('Coming Soon', `Payment integration for ${plan.name} is coming next!`);
  };

  const getPlanConfig = (planName) => {
    const name = planName?.toLowerCase() || '';
    if (name.includes('gold')) {
      return {
        color: Colors.warning,
        lightColor: Colors.lightWarning, // You might need to add this to Colors or use a hex
        gradient: [Colors.warning, '#F59E0B'],
        icon: Star
      };
    } else if (name.includes('premium')) {
      return {
        color: Colors.primary,
        lightColor: Colors.secondaryLight,
        gradient: [Colors.primary, Colors.primaryLight],
        icon: Crown
      };
    } else {
      return {
        color: Colors.textLight,
        lightColor: Colors.backgroundTertiary,
        gradient: [Colors.textLight, Colors.textSecondary],
        icon: Gift // Importing Gift icon
      };
    }
  };

  const formatPrice = (price) => {
    if (price === 0) return 'Free';
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const getDurationText = (days) => {
    if (days === 36500 || days > 1000) return 'Forever'; // Assumption for free plan
    if (days === 30) return '/month';
    if (days === 365) return '/year';
    return `/${days} days`;
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading Plans...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BlurView intensity={90} tint="light" style={StyleSheet.absoluteFill} />
        <Text style={styles.headerTitle}>Choose Your Plan</Text>
        <Text style={styles.headerSubtitle}>Unlock premium features to find your perfect match</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {plans.map((plan) => {
          const config = getPlanConfig(plan.name);
          const IconComponent = config.icon;
          const isCurrentPlan = currentSubscription?.plan === plan.name;
          const isPopular = plan.name.toLowerCase().includes('premium'); // Logic for 'Popular' badge

          return (
            <View key={plan._id} style={styles.planContainer}>
              {isPopular && (
                <View style={styles.popularBadge}>
                  <Sparkles size={14} color={Colors.white} />
                  <Text style={styles.popularText}>Most Popular</Text>
                </View>
              )}

              <View style={[
                styles.planCard,
                isPopular && styles.planCardPopular,
                isCurrentPlan && styles.planCardActive
              ]}>
                <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />

                {/* Plan Header */}
                <View style={styles.planHeader}>
                  <View style={styles.planHeaderLeft}>
                    <View style={[styles.planIconContainer, { backgroundColor: config.lightColor || '#f0f0f0' }]}>
                      <IconComponent size={24} color={config.color} fill={config.color} />
                    </View>
                    <View style={styles.planTitleContainer}>
                      <Text style={styles.planName}>{plan.name}</Text>
                      <View style={styles.priceContainer}>
                        <Text style={[styles.planPrice, { color: config.color }]}>
                          {formatPrice(plan.price)}
                        </Text>
                        <Text style={styles.planDuration}>{getDurationText(plan.durationInDays)}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Features List */}
                <View style={styles.featuresContainer}>
                  {plan.features.map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                      <View style={[
                        styles.featureIcon,
                        { backgroundColor: Colors.lightSuccess } // Assuming all listed features are 'included' for now
                      ]}>
                        <Check size={14} color={Colors.success} />
                      </View>
                      <Text style={styles.featureText}>
                        {feature}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Subscribe Button */}
                {isCurrentPlan ? (
                  <Pressable style={styles.currentPlanButton} disabled>
                    <Text style={styles.currentPlanText}>Current Plan</Text>
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={() => handleSubscribe(plan)}
                    style={styles.subscribeButton}
                  >
                    <LinearGradient
                      colors={config.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.subscribeGradient}
                    >
                      <Text style={styles.subscribeText}>
                        {plan.price === 0 ? 'Get Started' : `Upgrade to ${plan.name}`}
                      </Text>
                      {plan.price > 0 && <Zap size={18} color={Colors.white} fill={Colors.white} />}
                    </LinearGradient>
                  </Pressable>
                )}
              </View>
            </View>
          );
        })}

        {/* Benefits Section */}
        <View style={styles.benefitsSection}>
          <Text style={styles.benefitsTitle}>Why Upgrade?</Text>

          <View style={styles.benefitCard}>
            <View style={styles.benefitIconContainer}>
              <Eye size={24} color={Colors.primary} />
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Better Visibility</Text>
              <Text style={styles.benefitText}>
                Your profile gets shown to 10x more compatible matches
              </Text>
            </View>
          </View>

          <View style={styles.benefitCard}>
            <View style={styles.benefitIconContainer}>
              <Phone size={24} color={Colors.primary} />
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>View Contact Details</Text>
              <Text style={styles.benefitText}>
                Get direct access to phone numbers of your matches
              </Text>
            </View>
          </View>

          <View style={styles.benefitCard}>
            <View style={styles.benefitIconContainer}>
              <Shield size={24} color={Colors.primary} />
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Verified Profiles</Text>
              <Text style={styles.benefitText}>
                Get verified badge and access to verified members only
              </Text>
            </View>
          </View>
        </View>

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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.textSecondary,
    fontFamily: 'SpaceMono',
  },
  header: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: 'SpaceMono',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'SpaceMono',
    lineHeight: 20,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  planContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    left: 20,
    right: 20,
    zIndex: 10,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
    alignSelf: 'center',
  },
  popularText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
    fontFamily: 'SpaceMono',
  },
  planCard: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    overflow: 'hidden',
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  planCardPopular: {
    borderWidth: 2,
    borderColor: Colors.primary,
    paddingTop: 28,
  },
  planCardActive: {
    borderColor: Colors.success,
    backgroundColor: Colors.lightSuccess, // Subtle background for active plan
    borderWidth: 2,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  planHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  planIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  planTitleContainer: {
    flex: 1,
  },
  planName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: 'SpaceMono',
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'SpaceMono',
  },
  planDuration: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'SpaceMono',
  },
  featuresContainer: {
    marginBottom: 20,
    gap: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontFamily: 'SpaceMono',
    flex: 1,
  },
  currentPlanButton: {
    backgroundColor: Colors.backgroundTertiary,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  currentPlanText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
    fontFamily: 'SpaceMono',
  },
  subscribeButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  subscribeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  subscribeText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    fontFamily: 'SpaceMono',
  },
  benefitsSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  benefitsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: 'SpaceMono',
    marginBottom: 16,
  },
  benefitCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  benefitIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.secondaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontFamily: 'SpaceMono',
    marginBottom: 4,
  },
  benefitText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: 'SpaceMono',
    lineHeight: 18,
  },
});
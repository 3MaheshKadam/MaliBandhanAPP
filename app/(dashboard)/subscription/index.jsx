import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Colors } from '../../../constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Crown,
  Check,
  X,
  Star,
  Heart,
  Eye,
  MessageCircle,
  Sparkles,
  Shield,
  Zap
} from 'lucide-react-native';
import { BlurView } from 'expo-blur';

const subscriptionPlans = [
  {
    id: 'free',
    name: 'Free',
    price: '₹0',
    duration: 'Forever',
    color: Colors.textLight,
    lightColor: Colors.backgroundTertiary,
    features: [
      { text: 'Limited matches per day', included: true },
      { text: 'Basic profile visibility', included: true },
      { text: 'Send 5 interests/week', included: true },
      { text: 'View blurred photos', included: true },
      { text: 'Advanced search filters', included: false },
      { text: 'See who viewed you', included: false },
      { text: 'Unlimited messaging', included: false },
      { text: 'Priority support', included: false },
    ],
    popular: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '₹999',
    duration: '/month',
    color: Colors.primary,
    lightColor: Colors.secondaryLight,
    features: [
      { text: 'Unlimited daily matches', included: true },
      { text: 'Enhanced profile visibility', included: true },
      { text: 'Unlimited interests', included: true },
      { text: 'View full-size photos', included: true },
      { text: 'Advanced search filters', included: true },
      { text: 'See who viewed you', included: true },
      { text: 'Unlimited messaging', included: true },
      { text: 'Priority support', included: true },
      { text: 'Profile verification badge', included: true },
      { text: 'Ad-free experience', included: true },
    ],
    popular: true,
  },
  {
    id: 'gold',
    name: 'Gold',
    price: '₹1,999',
    duration: '/month',
    color: Colors.warning,
    lightColor: Colors.lightWarning,
    features: [
      { text: 'Everything in Premium', included: true },
      { text: 'Featured profile placement', included: true },
      { text: 'AI-powered matchmaking', included: true },
      { text: 'Dedicated relationship advisor', included: true },
      { text: 'Background verification', included: true },
      { text: 'Video call access', included: true },
      { text: 'Profile highlights', included: true },
      { text: 'Exclusive events access', included: true },
    ],
    popular: false,
  },
];

export default function Subscription() {
  const handleSubscribe = (planId) => {
    console.log('Subscribe to:', planId);
    // Add subscription logic here
  };

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
        {subscriptionPlans.map((plan) => (
          <View key={plan.id} style={styles.planContainer}>
            {plan.popular && (
              <View style={styles.popularBadge}>
                <Sparkles size={14} color={Colors.white} />
                <Text style={styles.popularText}>Most Popular</Text>
              </View>
            )}

            <View style={[
              styles.planCard,
              plan.popular && styles.planCardPopular
            ]}>
              <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
              {/* Plan Header */}
              <View style={styles.planHeader}>
                <View style={styles.planHeaderLeft}>
                  <View style={[styles.planIconContainer, { backgroundColor: plan.lightColor }]}>
                    {plan.id === 'free' ? (
                      <Heart size={24} color={plan.color} />
                    ) : plan.id === 'premium' ? (
                      <Crown size={24} color={plan.color} />
                    ) : (
                      <Star size={24} color={plan.color} fill={plan.color} />
                    )}
                  </View>
                  <View style={styles.planTitleContainer}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <View style={styles.priceContainer}>
                      <Text style={[styles.planPrice, { color: plan.color }]}>
                        {plan.price}
                      </Text>
                      <Text style={styles.planDuration}>{plan.duration}</Text>
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
                      feature.included
                        ? { backgroundColor: Colors.lightSuccess }
                        : { backgroundColor: Colors.lightDanger }
                    ]}>
                      {feature.included ? (
                        <Check size={14} color={Colors.success} />
                      ) : (
                        <X size={14} color={Colors.danger} />
                      )}
                    </View>
                    <Text style={[
                      styles.featureText,
                      !feature.included && styles.featureTextDisabled
                    ]}>
                      {feature.text}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Subscribe Button */}
              {plan.id === 'free' ? (
                <Pressable style={styles.currentPlanButton} disabled>
                  <Text style={styles.currentPlanText}>Current Plan</Text>
                </Pressable>
              ) : (
                <Pressable
                  onPress={() => handleSubscribe(plan.id)}
                  style={styles.subscribeButton}
                >
                  <LinearGradient
                    colors={
                      plan.id === 'gold'
                        ? [Colors.warning, '#F59E0B']
                        : [Colors.primary, Colors.primaryLight]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.subscribeGradient}
                  >
                    <Text style={styles.subscribeText}>
                      {plan.id === 'premium' ? 'Upgrade to Premium' : 'Upgrade to Gold'}
                    </Text>
                    <Zap size={18} color={Colors.white} fill={Colors.white} />
                  </LinearGradient>
                </Pressable>
              )}
            </View>
          </View>
        ))}

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
              <MessageCircle size={24} color={Colors.primary} />
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Unlimited Communication</Text>
              <Text style={styles.benefitText}>
                Chat with unlimited matches without restrictions
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
  featureTextDisabled: {
    color: Colors.textLight,
    textDecorationLine: 'line-through',
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
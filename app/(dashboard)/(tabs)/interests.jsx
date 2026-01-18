import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Dimensions,
  Pressable
} from 'react-native';
import { BlurView } from 'expo-blur';
import {
  User,
  Heart,
  Eye,
  CheckCircle,
  X,
  Clock,
  MapPin,
  Calendar,
  Briefcase,
  Shield,
  ThumbsUp,
  ThumbsDown,
  Send,
  Mail,
  Droplet,
  Users,
  Home,
  GraduationCap,
  DollarSign,
  ChevronDown,
  ChevronUp
} from 'lucide-react-native';
import { useSession } from '../../../context/SessionContext';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';

const { width } = Dimensions.get('window');

export default function InterestsPage() {
  const { user } = useSession();
  const router = useRouter();

  // All state declarations
  const [activeTab, setActiveTab] = useState('received');
  const [sentInterests, setSentInterests] = useState([]);
  const [receivedInterests, setReceivedInterests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [expandedImage, setExpandedImage] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    professional: false,
    family: false,
    lifestyle: false
  });
  const [hasSubscription, setHasSubscription] = useState(false);

  // Mask first name while keeping last name visible
  const maskFirstName = (fullName) => {
    if (!fullName) return '****';
    const names = fullName.split(' ');
    if (names.length > 1) {
      return `${'*'.repeat(names[0].length)} ${names.slice(1).join(' ')}`;
    }
    return '****';
  };

  // Calculate age from date of birth
  const calculateAge = (dateString) => {
    if (!dateString) return 'N/A';
    const birthDate = new Date(dateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Fetch interests from API
  const fetchInterests = async (type) => {
    try {
      if (!user?.id && !user?.user?.id) return [];
      const userId = user?.id ? user.id : user.user.id;
      const endpoint = type === 'send'
        ? `https://mali-bandhan.vercel.app/api/interest/send?userId=${userId}`
        : `https://mali-bandhan.vercel.app/api/interest/received?userId=${userId}`;
      const response = await fetch(endpoint);
      const data = await response.json();
      if (!response.ok) throw new Error('Failed to fetch data');
      return data;
    } catch (err) {
      throw err;
    }
  };

  // Load all interest data
  const loadAllData = async () => {
    if (!user?.id && !user?.user?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const [sent, received] = await Promise.all([
        fetchInterests('send'),
        fetchInterests('received')
      ]);
      setSentInterests(sent.interests || []);
      setReceivedInterests(received.interests || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Refresh data
  const handleRefresh = () => {
    setIsRefreshing(true);
    loadAllData();
  };

  // Handle interest actions (accept/decline/cancel)
  const handleInterestAction = async (action, interestId) => {
    try {
      const response = await fetch('https://mali-bandhan.vercel.app/api/interest/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action, interestId })
      });
      if (!response.ok) throw new Error('Action failed');
      loadAllData();
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle viewing profile with subscription check
  const handleViewProfile = (person, type) => {
    if (!hasSubscription) {
      router.push('/dashboard/subscription');
      return;
    }
    const profileData = type === 'sent' ? person.receiver : person.sender;
    setSelectedProfile({
      ...profileData,
      image: profileData?.profilePhoto || profileData?.image
    });
    setShowModal(true);
  };

  // Toggle profile sections
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Initialize component
  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  // Get status badge component
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <View style={styles.badgePending}>
            <Clock size={14} color={Colors.warning} />
            <Text style={styles.badgeText} numberOfLines={1}>Pending</Text>
          </View>
        );
      case 'accepted':
        return (
          <View style={styles.badgeAccepted}>
            <CheckCircle size={14} color={Colors.success} />
            <Text style={styles.badgeText} numberOfLines={1}>Accepted</Text>
          </View>
        );
      case 'declined':
        return (
          <View style={styles.badgeDeclined}>
            <X size={14} color={Colors.danger} />
            <Text style={styles.badgeText} numberOfLines={1}>Declined</Text>
          </View>
        );
      default: return null;
    }
  };

  // Interest Card Component
  const InterestCard = ({ person, type }) => {
    const profile = type === 'sent' ? person.receiver : person.sender;
    const profileImage = profile?.profilePhoto || profile?.image;

    return (
      <View style={[styles.card, { backgroundColor: 'transparent', overflow: 'hidden' }]}>
        <BlurView intensity={70} tint="light" style={StyleSheet.absoluteFill} />
        <View style={styles.cardContent}>
          {/* Profile Image */}
          <TouchableOpacity
            onPress={() => profileImage && setExpandedImage(profileImage)}
            style={styles.avatarContainer}
          >
            <View style={styles.avatar}>
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              ) : (
                <User size={24} color={Colors.textLight} />
              )}
            </View>
            {profile?.isOnline && (
              <View style={styles.onlineIndicator} />
            )}
          </TouchableOpacity>

          {/* Profile Details */}
          <View style={styles.profileDetails}>
            <View style={styles.profileHeader}>
              <View style={styles.profileInfoContainer}>
                <Text style={styles.profileName} numberOfLines={1}>
                  {hasSubscription ? profile?.name : maskFirstName(profile?.name)}
                </Text>
                <View style={styles.profileInfo}>
                  <View style={styles.infoItem}>
                    <Calendar size={16} color={Colors.textSecondary} />
                    <Text style={styles.infoText} numberOfLines={1}>{calculateAge(profile?.dob)} yrs</Text>
                  </View>
                  {profile?.currentCity && (
                    <View style={styles.infoItem}>
                      <MapPin size={16} color={Colors.textSecondary} />
                      <Text style={styles.infoText} numberOfLines={1}>{profile?.currentCity}</Text>
                    </View>
                  )}
                </View>
              </View>
              {getStatusBadge(person.status)}
            </View>

            {(profile?.occupation || profile?.education) && (
              <View style={styles.occupationContainer}>
                <Briefcase size={16} color={Colors.textSecondary} />
                <Text style={styles.occupationText} numberOfLines={1}>
                  {profile?.occupation}{profile?.occupation && profile?.education && ' • '}{profile?.education}
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionContainer}>
              <Text style={styles.dateText} numberOfLines={1}>
                {type === 'sent' ? `Sent: ${new Date(person.createdAt).toLocaleDateString()}` :
                  `Received: ${new Date(person.createdAt).toLocaleDateString()}`}
              </Text>

              <View style={styles.actionButtons}>
                {type === 'received' && person.status === 'pending' && (
                  <>
                    <TouchableOpacity
                      onPress={() => handleInterestAction('declined', person._id)}
                      style={styles.declineButton}
                    >
                      <ThumbsDown size={16} color={Colors.danger} />
                      <Text style={styles.actionText} numberOfLines={1}>Decline</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleInterestAction('accepted', person._id)}
                      style={styles.acceptButton}
                    >
                      <ThumbsUp size={16} color={Colors.success} />
                      <Text style={styles.actionText} numberOfLines={1}>Accept</Text>
                    </TouchableOpacity>
                  </>
                )}

                <TouchableOpacity
                  onPress={() => handleViewProfile(person, type)}
                  style={styles.viewButton}
                >
                  <Eye size={16} color={Colors.primary} />
                  <Text style={styles.actionText} numberOfLines={1}>View</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const ProfileDetailItem = ({ icon: Icon, label, value }) => (
    <View style={styles.detailItem}>
      <View style={styles.detailIcon}>
        <Icon size={20} color={Colors.primary} />
      </View>
      <View style={styles.detailContent}>
        <Text style={styles.detailLabel} numberOfLines={1}>{label}</Text>
        <Text style={styles.detailValue} numberOfLines={2}>{value || 'Not specified'}</Text>
      </View>
    </View>
  );

  const ProfileSection = ({ title, children, sectionKey }) => (
    <View style={styles.section}>
      <TouchableOpacity
        onPress={() => toggleSection(sectionKey)}
        style={styles.sectionHeader}
      >
        <Text style={styles.sectionTitle} numberOfLines={1}>{title}</Text>
        {expandedSections[sectionKey] ? (
          <ChevronUp size={20} color={Colors.textSecondary} />
        ) : (
          <ChevronDown size={20} color={Colors.textSecondary} />
        )}
      </TouchableOpacity>
      {expandedSections[sectionKey] && (
        <View style={styles.sectionContent}>
          {children}
        </View>
      )}
    </View>
  );

  const getTabData = () => activeTab === 'sent' ? sentInterests : receivedInterests;
  const getTabStats = () => ({
    pendingSent: sentInterests?.filter(p => p.status === 'pending').length,
    pendingReceived: receivedInterests?.filter(p => p.status === 'pending').length
  });

  const stats = getTabStats();

  if (isLoading && !isRefreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText} numberOfLines={1}>Loading your Interests</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorIcon}>
          <X size={32} color={Colors.danger} />
        </View>
        <Text style={styles.errorTitle} numberOfLines={1}>Error loading interests</Text>
        <Text style={styles.errorMessage} numberOfLines={2}>{error}</Text>
        <TouchableOpacity
          onPress={handleRefresh}
          style={styles.retryButton}
        >
          <Text style={styles.retryButtonText} numberOfLines={1}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Expanded Image Viewer */}
      <Modal
        visible={!!expandedImage}
        transparent={true}
        onRequestClose={() => setExpandedImage(null)}
      >
        <View style={styles.imageModal}>
          <TouchableOpacity
            style={styles.closeImageButton}
            onPress={() => setExpandedImage(null)}
          >
            <X size={24} color={Colors.white} />
          </TouchableOpacity>
          <Image
            source={{ uri: expandedImage }}
            style={styles.expandedImage}
            resizeMode="contain"
          />
        </View>
      </Modal>

      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Your Interests</Text>
        <View style={styles.headerDivider} />
      </View>

      {/* Profile Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        {selectedProfile && (
          <View style={styles.profileModal}>
            <BlurView intensity={90} tint="light" style={StyleSheet.absoluteFill} />
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={1}>{selectedProfile.name}'s Profile</Text>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                style={styles.closeModalButton}
              >
                <X size={24} color={Colors.white} />
              </TouchableOpacity>
            </View>

            {/* Scrollable Content */}
            <ScrollView style={styles.modalContent}>
              {/* Profile Header */}
              <View style={styles.profileHeaderModal}>
                <TouchableOpacity
                  onPress={() => setExpandedImage(selectedProfile.image)}
                  style={styles.profileAvatarContainer}
                >
                  <View style={styles.profileAvatar}>
                    {selectedProfile.image ? (
                      <Image
                        source={{ uri: selectedProfile.image }}
                        style={styles.profileAvatarImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <User size={32} color={Colors.textLight} />
                    )}
                  </View>
                </TouchableOpacity>

                <View style={styles.profileInfoModal}>
                  <Text style={styles.profileNameModal} numberOfLines={1}>{selectedProfile.name}</Text>
                  <View style={styles.profileInfoRow}>
                    <Text style={styles.profileInfoText} numberOfLines={1}>{calculateAge(selectedProfile.dob)} yrs</Text>
                    {selectedProfile.height && (
                      <Text style={styles.profileInfoText} numberOfLines={1}>{selectedProfile.height}</Text>
                    )}
                  </View>
                  {selectedProfile.currentCity && (
                    <View style={styles.locationContainer}>
                      <MapPin size={16} color={Colors.textSecondary} />
                      <Text style={styles.locationText} numberOfLines={1}>{selectedProfile.currentCity}</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Basic Information */}
              <ProfileSection title="Basic Information" sectionKey="basic">
                <View style={styles.sectionItems}>
                  <ProfileDetailItem icon={Calendar} label="Date of Birth"
                    value={new Date(selectedProfile.dob).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  />
                  <ProfileDetailItem icon={MapPin} label="Birth Place" value={selectedProfile.birthPlace} />
                  <ProfileDetailItem icon={Droplet} label="Blood Group" value={selectedProfile.bloodGroup} />
                  <ProfileDetailItem icon={User} label="Gender" value={selectedProfile.gender} />
                  <ProfileDetailItem icon={Shield} label="Religion" value={selectedProfile.religion} />
                  <ProfileDetailItem icon={Shield} label="Caste" value={selectedProfile.caste} />
                </View>
              </ProfileSection>

              {/* Family Details */}
              <ProfileSection title="Family Details" sectionKey="family">
                <View style={styles.sectionItems}>
                  <ProfileDetailItem icon={User} label="Father's Name" value={selectedProfile.fatherName} />
                  <ProfileDetailItem icon={User} label="Mother's Name" value={selectedProfile.mother} />
                  <ProfileDetailItem icon={Users} label="Brothers" value={selectedProfile.brothers} />
                  <ProfileDetailItem icon={Users} label="Sisters" value={selectedProfile.sisters} />
                  <ProfileDetailItem icon={Home} label="Native City" value={selectedProfile.nativeCity} />
                </View>
              </ProfileSection>

              {/* Professional Information */}
              <ProfileSection title="Professional Information" sectionKey="professional">
                <View style={styles.sectionItems}>
                  <ProfileDetailItem icon={Briefcase} label="Occupation" value={selectedProfile.occupation} />
                  <ProfileDetailItem icon={Briefcase} label="Company" value={selectedProfile.company} />
                  <ProfileDetailItem icon={GraduationCap} label="Education" value={selectedProfile.education} />
                  <ProfileDetailItem icon={GraduationCap} label="College" value={selectedProfile.college} />
                  <ProfileDetailItem icon={DollarSign} label="Income" value={selectedProfile.income} />
                </View>
              </ProfileSection>
            </ScrollView>
          </View>
        )}
      </Modal>

      {/* Main Content */}
      <ScrollView
        style={styles.mainScroll}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Tabs */}
        <View style={styles.tabContainer}>
          <View style={styles.tabBar}>
            {[
              { id: 'received', label: 'Received', icon: Mail, count: receivedInterests.length },
              { id: 'sent', label: 'Sent', icon: Send, count: sentInterests.length }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <TouchableOpacity
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id)}
                  style={[styles.tab, activeTab === tab.id && styles.activeTab]}
                >
                  <View style={styles.tabContentRow}>
                    <Icon size={16} color={activeTab === tab.id ? Colors.primary : Colors.textSecondary} />
                    <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]} numberOfLines={1}>
                      {tab.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Tab Content */}
          <View style={styles.tabContent}>
            {getTabData().length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <Heart size={24} color={Colors.primary} />
                </View>
                <Text style={styles.emptyTitle} numberOfLines={1}>
                  {activeTab === 'sent' ? 'No Interests Sent Yet' : 'No Interests Received Yet'}
                </Text>
                <Text style={styles.emptyMessage} numberOfLines={2}>
                  {activeTab === 'sent'
                    ? 'Start browsing profiles and express your interest!'
                    : 'Your perfect match might be just around the corner!'}
                </Text>
              </View>
            ) : (
              <View style={styles.cardList}>
                {getTabData().map((person, index) => (
                  <InterestCard
                    key={index}
                    person={person}
                    type={activeTab}
                  />
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
    fontFamily: 'SpaceMono',
    maxWidth: width * 0.8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: Colors.backgroundSecondary,
  },
  errorIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.lightDanger,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
    fontFamily: 'SpaceMono',
    maxWidth: width * 0.8,
  },
  errorMessage: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'SpaceMono',
    maxWidth: width * 0.8,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'SpaceMono',
  },
  headerContainer: {
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontFamily: 'SpaceMono',
  },
  headerDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginTop: 16,
  },
  imageModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeImageButton: {
    position: 'absolute',
    top: 48,
    right: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
    borderRadius: 20,
  },
  expandedImage: {
    width: width,
    height: '66%',
  },
  profileModal: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  modalHeader: {
    backgroundColor: Colors.primary,
    padding: 16,
    paddingTop: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.white,
    fontFamily: 'SpaceMono',
    flexShrink: 1,
  },
  closeModalButton: {
    padding: 4,
  },
  modalContent: {
    paddingHorizontal: 16,
  },
  profileHeaderModal: {
    flexDirection: 'row',
    marginBottom: 24,
    padding: 16,
  },
  profileAvatarContainer: {
    marginRight: 16,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.secondaryLight,
  },
  profileAvatarImage: {
    width: '100%',
    height: '100%',
  },
  profileInfoModal: {
    flex: 1,
  },
  profileNameModal: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
    fontFamily: 'SpaceMono',
    flexShrink: 1,
  },
  profileInfoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  profileInfoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'SpaceMono',
    flexShrink: 1,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  locationText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 4,
    fontFamily: 'SpaceMono',
    flexShrink: 1,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontFamily: 'SpaceMono',
    flexShrink: 1,
  },
  sectionContent: {
    padding: 12,
  },
  sectionItems: {
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  detailIcon: {
    backgroundColor: Colors.secondaryLight,
    padding: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 4,
    fontFamily: 'SpaceMono',
    flexShrink: 1,
  },
  detailValue: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontFamily: 'SpaceMono',
    flexShrink: 1,
  },
  mainScroll: {
    flex: 1,
  },
  tabContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    fontFamily: 'SpaceMono',
    flexShrink: 1,
  },
  activeTabText: {
    color: Colors.primary,
  },
  tabContent: {
    padding: 12,
  },
  emptyState: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.secondaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
    fontFamily: 'SpaceMono',
    flexShrink: 1,
  },
  emptyMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontFamily: 'SpaceMono',
    maxWidth: width * 0.8,
  },
  cardList: {
    gap: 12,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  profileDetails: {
    flex: 1,
    marginLeft: 12,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  profileInfoContainer: {
    flex: 1,
    marginRight: 8,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontFamily: 'SpaceMono',
    flexShrink: 1,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 4,
    fontFamily: 'SpaceMono',
    flexShrink: 1,
  },
  occupationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  occupationText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 8,
    fontFamily: 'SpaceMono',
    flexShrink: 1,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  dateText: {
    fontSize: 12,
    color: Colors.textLight,
    fontFamily: 'SpaceMono',
    flexShrink: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  declineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: Colors.lightDanger,
    borderRadius: 8,
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: Colors.lightSuccess,
    borderRadius: 8,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: Colors.secondaryLight,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
    fontFamily: 'SpaceMono',
    color: Colors.textPrimary,
  },
  badgePending: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: Colors.lightWarning,
  },
  badgeAccepted: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: Colors.lightSuccess,
  },
  badgeDeclined: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: Colors.lightDanger,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
    fontFamily: 'SpaceMono',
    color: Colors.textPrimary,
    flexShrink: 1,
  },
});
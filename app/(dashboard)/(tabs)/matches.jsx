import { BlurView } from 'expo-blur';
import React, { useState, useEffect, useMemo, memo } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Image,
    ScrollView,
    TextInput,
    Dimensions,
    Animated,
    StyleSheet,
    Pressable,
    Modal,
    ActivityIndicator,
    Switch,
} from 'react-native';
import {
    Heart,
    User,
    MapPin,
    GraduationCap,
    Briefcase,
    Calendar,
    Star,
    CheckCircle,
    Lock,
    Camera,
    Clock,
    Crown,
    Sparkles,
    Filter,
    ArrowUpDown,
    Eye,
    MessageCircle,
    Users as UsersIcon,
    Navigation,
    ArrowDown,
    SlidersHorizontal,
    X,
    Search,
    Droplet,
    Shield,
    Home,
    DollarSign,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSession } from '@/context/SessionContext';
import { Config } from '@/constants/Config';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';

const { width } = Dimensions.get('window');

// Utility function to mask first names
const maskFirstName = (fullName) => {
    if (!fullName) return '****';
    const names = fullName.split(' ');
    return names.length > 1 ? `${'*'.repeat(names[0].length)} ${names.slice(1).join(' ')}` : '****';
};

// Helper function for case-insensitive city comparison
const isSameCity = (city1, city2) => {
    if (!city1 || !city2) return false;
    const c1 = city1.toLowerCase().trim();
    const c2 = city2.toLowerCase().trim();
    return c1.includes(c2) || c2.includes(c1);
};

// Levenshtein distance for fuzzy matching (typo tolerance)
const getLevenshteinDistance = (a, b) => {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
                );
            }
        }
    }
    return matrix[b.length][a.length];
};

const isFuzzyMatch = (value, filter) => {
    if (!filter) return true;
    if (!value) return false;

    // Normalize: lowercase, remove special chars, collapse multiple spaces
    const v = value.toString().toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
    const f = filter.toString().toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();

    // 1. Direct match or substring
    if (v.includes(f) || f.includes(v)) return true;

    // 2. Typo tolerance (Levenshtein)
    // Allow 1 typo for short words (<=4), 2 typos for longer words
    const distance = getLevenshteinDistance(v, f);
    const threshold = f.length <= 4 ? 1 : 2;

    return distance <= threshold;
};

import FeedbackModal from '@/components/FeedbackModal';

const MatchesPage = () => {
    const { user } = useSession();
    const [isLoaded, setIsLoaded] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [sortBy, setSortBy] = useState('compatibility');
    const [showQuickFilters, setShowQuickFilters] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [matches, setMatches] = useState([]);
    const [hasSubscription, setHasSubscription] = useState(true);
    const [checkingSubscription, setCheckingSubscription] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterAnimation] = useState(new Animated.Value(0));
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [missingFields, setMissingFields] = useState([]); // Added state for missing fields
    const [isProfileIncomplete, setIsProfileIncomplete] = useState(false); // Added state
    const [showFilterModal, setShowFilterModal] = useState(false); // Added for Filter Modal
    const [connectedUserIds, setConnectedUserIds] = useState(new Set());

    // Feedback Modal State
    const [feedbackVisible, setFeedbackVisible] = useState(false);
    const [feedbackConfig, setFeedbackConfig] = useState({
        type: 'info',
        title: '',
        message: '',
        actions: []
    });

    const showFeedback = (type, title, message, actions = []) => {
        setFeedbackConfig({ type, title, message, actions });
        setFeedbackVisible(true);
    };

    const quickFilters = useMemo(
        () => ({
            gender: 'All', // Added Gender
            ageRange: [18, 60], // Added Age Range defaults
            location: '', // City/State/District
            maritalStatus: [], // Array for multiple selection
            caste: '',
            subCaste: '', // Added Sub-caste
            education: '', // Level (Graduate/PG/etc)
            occupation: '', // Category
            diet: 'Any', // Added Diet
            withPhoto: false, // Default false, toggleable
            activeRecently: false // Default false
        }),
        []
    );

    const [filters, setFilters] = useState(quickFilters);
    const insets = useSafeAreaInsets();

    // Robustly get current user's city (handle potential nesting)
    const currentUserCity = user?.currentCity || user?.user?.currentCity;

    useEffect(() => {
        const initialize = async () => {
            setIsLoaded(true);
            await checkSubscription();
            // Initial fetch without query
            await fetchUsers();
        };
        initialize();
    }, [user]);

    // Debounced search effect
    useEffect(() => {
        if (!isLoaded) return;

        // Auto-switch to 'all' tab when searching to prevent local filtering hiding results
        if (searchQuery.trim().length > 0) {
            setActiveTab('all');
        }

        const timeoutId = setTimeout(() => {
            fetchUsers(searchQuery);
        }, 500); // 500ms debounce

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    useEffect(() => {
        Animated.spring(filterAnimation, {
            toValue: showQuickFilters ? 1 : 0,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
        }).start();
    }, [showQuickFilters]);

    const checkSubscription = async () => {
        try {
            setCheckingSubscription(true);

            // Check nested structure often returned by API
            const subscriptionParams = user?.subscription || user?.user?.subscription;

            const planName = subscriptionParams?.plan?.toLowerCase() || '';

            // Check for explicitly true boolean, OR valid plan names (case-insensitive)
            const isSubscribed =
                subscriptionParams?.isSubscribed === true ||
                ['gold', 'premium'].some(p => planName.includes(p));

            setHasSubscription(!!isSubscribed);
            if (hasSubscription !== !!isSubscribed) {
                await fetchUsers();
            }
        } catch (err) {
            console.error('Error checking subscription:', err);
            setHasSubscription(false);
        } finally {
            setCheckingSubscription(false);
        }
    };

    const calculateAge = (dob) => {
        if (!dob) return null;
        const birthDate = new Date(dob);
        const ageDiff = Date.now() - birthDate.getTime();
        return Math.floor(ageDiff / (1000 * 60 * 60 * 24 * 365.25));
    };

    const calculateCompatibility = (userProfile, matchProfile) => {
        const expectationFields = [
            { expectation: 'expectedCaste', matchField: 'caste' },
            { expectation: 'preferredCity', matchField: 'currentCity' },
            { expectation: 'expectedEducation', matchField: 'education' },
            { expectation: 'expectedHeight', matchField: 'height' },
            { expectation: 'expectedIncome', matchField: 'income' },
            { expectation: 'divorcee', matchField: 'maritalStatus' },
            { expectation: 'expectedAgeDifference', matchField: 'age' },
        ];

        const totalFields = expectationFields.length;
        const percentagePerField = 100 / totalFields;
        let matchedPercentage = 0;

        expectationFields.forEach(({ expectation, matchField }) => {
            const expectedValue = userProfile[expectation];
            const matchValue = matchProfile[matchField];

            if (!expectedValue || !matchValue) return;

            if (expectation === 'expectedEducation' && matchField === 'education') {
                const educationHierarchy = ["Doctorate", "Master's Degree", "Bachelor's Degree", 'High School'];
                const expectedIndex = educationHierarchy.indexOf(expectedValue);
                const matchIndex = educationHierarchy.indexOf(matchValue);

                if (expectedIndex !== -1 && matchIndex !== -1) {
                    matchedPercentage += matchIndex <= expectedIndex ? percentagePerField : percentagePerField / 2;
                }
            } else if (expectation === 'expectedAgeDifference') {
                const userAge = calculateAge(userProfile.dob);
                const matchAge = matchProfile.age;
                const ageDiff = Math.abs(userAge - matchAge);

                if (
                    (expectedValue === '1' && ageDiff <= 1) ||
                    (expectedValue === '2' && ageDiff <= 2) ||
                    (expectedValue === '3' && ageDiff <= 3) ||
                    (expectedValue === '5' && ageDiff <= 5) ||
                    (expectedValue === '6+' && ageDiff >= 6)
                ) {
                    matchedPercentage += percentagePerField;
                }
            } else if (expectation === 'expectedHeight' && matchField === 'height') {
                const extractCm = (str) => {
                    const match = str.match(/(\d+)\s*cm/i);
                    return match ? parseInt(match[1]) : null;
                };

                let expectedMinCm, expectedMaxCm;
                if (expectedValue.includes('–') || expectedValue.includes('-')) {
                    const [rangeStart, rangeEnd] = expectedValue.split(/[–-]/);
                    expectedMinCm = extractCm(rangeStart);
                    expectedMaxCm = extractCm(rangeEnd);
                } else if (expectedValue.includes('& above')) {
                    expectedMinCm = extractCm(expectedValue);
                    expectedMaxCm = Infinity;
                } else {
                    expectedMinCm = extractCm(expectedValue);
                    expectedMaxCm = expectedMinCm;
                }

                const userHeightCm = extractCm(matchValue);
                if (expectedMinCm !== null && expectedMaxCm !== null && userHeightCm !== null) {
                    if (userHeightCm >= expectedMinCm && userHeightCm <= expectedMaxCm) {
                        matchedPercentage += percentagePerField;
                    }
                }
            } else if (expectation === 'expectedIncome' && matchField === 'income') {
                if (expectedValue === matchValue) {
                    matchedPercentage += percentagePerField;
                }
            } else if (expectation === 'preferredCity' && matchField === 'currentCity') {
                if (isSameCity(expectedValue, matchValue)) {
                    matchedPercentage += percentagePerField;
                }
            } else if (expectation === 'divorcee' && matchField === 'maritalStatus') {
                if (expectedValue === 'yes' || matchValue === 'Unmarried') {
                    matchedPercentage += percentagePerField;
                }
            } else if (expectedValue === matchValue) {
                matchedPercentage += percentagePerField;
            } else if (expectation === 'expectedCaste' && matchField === 'caste') {
                const [expectedMainCaste, expectedSubCaste] = expectedValue.split('-');
                const [matchMainCaste, matchSubCaste] = matchValue.split('-');

                if (expectedMainCaste === matchMainCaste) {
                    matchedPercentage += expectedSubCaste && matchSubCaste && expectedSubCaste === matchSubCaste ? percentagePerField : percentagePerField / 2;
                }
            }
        });

        return Math.min(100, Math.round(matchedPercentage));
    };

    const fetchInterestsAndConnections = async (userId) => {
        if (!userId) return [];
        try {
            console.log('Fetching interests for user:', userId);

            // 1. Fetch Sent Interests
            const sentRes = await fetch(`${Config.API_URL}/api/interest/send?userId=${userId}`);
            const sentData = await sentRes.json();

            // 2. Fetch Received Interests
            const receivedRes = await fetch(`${Config.API_URL}/api/interest/received?userId=${userId}`);
            const receivedData = await receivedRes.json();

            let sentIds = [];
            let connectedIds = new Set();

            if (sentData.success) {
                sentData.interests.forEach(i => {
                    const receiverId = i.receiver?._id || i.receiver?.id || i.receiver;
                    sentIds.push(receiverId);
                    if (i.status === 'accepted') {
                        connectedIds.add(receiverId);
                    }
                });
            }

            if (receivedData.success) {
                receivedData.interests.forEach(i => {
                    const senderId = i.sender?._id || i.sender?.id || i.sender;
                    // If I accepted their interest, or they accepted mine (handled in sent loop), we are connected.
                    if (i.status === 'accepted') {
                        connectedIds.add(senderId);
                    }
                });
            }

            console.log('Connected IDs:', Array.from(connectedIds));
            setConnectedUserIds(connectedIds);
            return sentIds;
        } catch (err) {
            console.error('Error fetching interests/connections:', err);
            return [];
        }
    };

    const fetchUsers = async (query = '') => {
        try {
            setIsLoading(true);
            const currentUserRes = await fetch(`${Config.API_URL}/api/users/me`, {
                credentials: 'include',
            });

            if (currentUserRes.status === 401) {
                throw new Error('Unauthorized - Please login again');
            }

            const currentUserData = await currentUserRes.json();

            // Profile Completion Check
            // Handle potential data wrapper
            const userObj = currentUserData.data || currentUserData;

            // Profile Completion Check - stricter requirements including Partner Preferences
            const essentialFields = [
                'dob', 'height', 'currentCity', 'education', 'income', 'maritalStatus', 'caste',
                'expectedAgeDifference', 'expectedHeight', 'expectedEducation', 'expectedIncome'
            ];
            const missingFields = essentialFields.filter(field => {
                const val = userObj[field];
                return val === null || val === undefined || (typeof val === 'string' && val.trim() === '');
            });

            // DEBUG ALERT - REMOVE AFTER FIXING
            /*
            alert(JSON.stringify({
                dob: userObj.dob,
                height: userObj.height,
                city: userObj.currentCity,
                edu: userObj.education,
                inc: userObj.income,
                ms: userObj.maritalStatus,
                caste: userObj.caste,
                missing: missingFields
            }, null, 2));
            */

            if (missingFields.length > 0) {
                console.log('Profile incomplete. Missing:', missingFields);
                setMissingFields(missingFields);
                setIsProfileIncomplete(true);
                setShowCompletionModal(true);
                setIsLoading(false);
                setMatches([]);
                return;
            } else {
                setMissingFields([]);
                setIsProfileIncomplete(false);
            }

            const sentReceiverIds = await fetchInterestsAndConnections(currentUserData._id || currentUserData.id);
            console.log('Final list of sent receiver IDs:', sentReceiverIds);

            let endpoint = `${Config.API_URL}/api/users/fetchAllUsers?limit=20&page=1`;
            if (query && query.trim().length > 0) {
                endpoint = `${Config.API_URL}/api/users/search?q=${encodeURIComponent(query)}&limit=20&page=1`;
            }

            const res = await fetch(endpoint);
            const data = await res.json();

            if (data.success) {
                const enriched = data.data
                    .filter((matchUser) => {
                        // Basic filtering: Self and Gender
                        // Note: currentUserData might use _id or id depending on API response
                        const currentUserId = currentUserData.id || currentUserData._id;
                        if (matchUser._id === currentUserId) return false;
                        if (matchUser.gender === currentUserData.gender) return false;

                        // If searching, show all matching results regardless of profile completeness
                        if (query && query.trim().length > 0) return true;

                        // If browsing (no search), require complete profile for quality
                        return (
                            matchUser.dob &&
                            matchUser.height &&
                            matchUser.currentCity &&
                            matchUser.education &&
                            matchUser.income &&
                            matchUser.maritalStatus &&
                            matchUser.caste
                        );
                    })
                    .map((matchUser) => {
                        const compatibility = calculateCompatibility(currentUserData, {
                            ...matchUser,
                            age: calculateAge(matchUser.dob),
                        });

                        return {
                            ...matchUser,
                            age: calculateAge(matchUser.dob),
                            profilePhoto: matchUser.profilePhoto || 'https://via.placeholder.com/200x250?text=Profile',
                            hasPhoto: !!matchUser.profilePhoto,
                            isBlurred: !hasSubscription,
                            matchType: 'all',
                            mutualMatch: false,
                            interestSent: sentReceiverIds.includes(matchUser._id),
                            shortlisted: false,
                            compatibility,
                            bio: matchUser.bio || 'Looking for a compatible life partner.',
                            isNew: Math.random() > 0.7,
                            lastActive: ['Recently', 'Today', '1 day ago', '2 days ago'][Math.floor(Math.random() * 4)],
                        };
                    });

                setMatches(enriched);
            }
        } catch (err) {
            console.error('Failed to fetch matches:', err);
        } finally {
            setIsLoading(false);
        }
    };



    const tabs = useMemo(
        () => [
            { id: 'all', label: 'All', count: matches.filter((m) => m.compatibility > 0).length, icon: UsersIcon },
            // { id: 'preferred', label: 'Top', count: matches.filter((m) => m.compatibility >= 70).length, icon: Star }, // Removed Top
            { id: 'new', label: 'New', count: matches.filter((m) => m.isNew).length, icon: Sparkles },
            {
                id: 'nearby',
                label: 'Nearby',
                count: matches.filter((m) => isSameCity(m.currentCity, currentUserCity)).length,
                icon: Navigation,
            },
            { id: 'filter', label: 'Filter', count: 0, icon: Filter }, // Added Filter Tab
        ],
        [matches, currentUserCity]
    );

    const filteredMatches = useMemo(
        () =>
            matches
                .filter((match) => {
                    let shouldShow = true;

                    // DEBUG: Trace filtering for matching user
                    if (match.name.includes('Ananya')) {
                        console.log('Filtering Ananya:', {
                            activeTab,
                            filters,
                            currentUserCity,
                            matchCity: match.currentCity
                        });
                    }

                    // Server-side search handles the query now, so we remove the client-side check
                    // if (searchQuery) {
                    //     shouldShow = shouldShow && match.currentCity?.toLowerCase().includes(searchQuery.toLowerCase());
                    // }

                    if (activeTab !== 'all') {
                        if (activeTab === 'preferred' && match.compatibility < 70) return false;
                        if (activeTab === 'new' && !match.isNew) return false;
                        if (activeTab === 'nearby' && !isSameCity(match.currentCity, currentUserCity)) return false;
                    }

                    // 1. Gender Filter
                    if (filters.gender !== 'All' && filters.gender) {
                        shouldShow = shouldShow && match.gender === filters.gender;
                    }

                    // 2. Age Range Filter
                    if (filters.ageRange[0] !== null && filters.ageRange[1] !== null) {
                        shouldShow = shouldShow && match.age >= filters.ageRange[0] && match.age <= filters.ageRange[1];
                    }

                    // 3. Location Filter (City/District/State) - Fuzzy Match
                    if (filters.location) {
                        shouldShow = shouldShow && isFuzzyMatch(match.currentCity, filters.location);
                    }

                    // 4. Marital Status Filter (Multiple Selection)
                    if (filters.maritalStatus.length > 0) {
                        shouldShow = shouldShow && filters.maritalStatus.includes(match.maritalStatus);
                    }

                    // 5. Community Filters
                    if (filters.caste) {
                        shouldShow = shouldShow && isFuzzyMatch(match.caste, filters.caste);
                    }
                    if (filters.subCaste) {
                        // Assuming subCaste field exists or is part of caste string
                        shouldShow = shouldShow && isFuzzyMatch(match.subCaste, filters.subCaste);
                    }

                    // 6. Education & Work
                    if (filters.education) {
                        shouldShow = shouldShow && isFuzzyMatch(match.education, filters.education);
                    }
                    if (filters.occupation) {
                        shouldShow = shouldShow && isFuzzyMatch(match.occupation, filters.occupation);
                    }

                    // 7. Lifestyle (Diet)
                    if (filters.diet !== 'Any' && filters.diet) {
                        // Robust check if diet field is missing
                        shouldShow = shouldShow && (match.diet === filters.diet);
                    }

                    // 8. Quick Filters
                    if (filters.withPhoto) {
                        shouldShow = shouldShow && !!match.hasPhoto;
                    }
                    if (filters.activeRecently) {
                        // "Recently" usually means within 7 or 30 days.
                        // Our match.lastActive is a string like "Recently", "Today".
                        // Logic depending on string values:
                        const recentStrings = ['Recently', 'Today', '1 day ago', '2 days ago'];
                        shouldShow = shouldShow && recentStrings.includes(match.lastActive);
                    }

                    return shouldShow;
                })
                .sort((a, b) => {
                    if (sortBy === 'compatibility') return b.compatibility - a.compatibility;
                    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
                    if (sortBy === 'recently_active') return new Date(b.lastActive) - new Date(a.lastActive);
                    if (sortBy === 'age_low') return a.age - b.age;
                    if (sortBy === 'age_high') return b.age - a.age;
                    return 0;
                }),
        [matches, searchQuery, activeTab, filters, sortBy, currentUserCity]
    );

    const handleSendInterest = async (senderId, receiverId) => {
        if (senderId === receiverId) return;

        const alreadySent = matches.find((m) => m._id === receiverId)?.interestSent;
        if (alreadySent) {
            showFeedback('info', 'Interest Shared', 'You have already expressed interest in this person.');
            return;
        }

        if (!hasSubscription) {
            showFeedback(
                'info',
                'Membership Required',
                'You need a premium subscription to send interests.',
                [
                    { text: 'Cancel', style: 'cancel', onPress: () => setFeedbackVisible(false) },
                    {
                        text: 'Upgrade', onPress: () => {
                            setFeedbackVisible(false);
                            router.push('/(dashboard)/(tabs)/settings');
                        }
                    }
                ]
            );
            return;
        }

        try {
            const res = await fetch(`${Config.API_URL}/api/interest/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    senderId,
                    receiverId,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setMatches((prev) =>
                    prev.map((match) => (match._id === receiverId ? { ...match, interestSent: true } : match))
                );
                showFeedback('success', 'Success', 'Interest sent successfully!');
            } else {
                showFeedback('error', 'Action Failed', data.message || 'Failed to send interest. Please try again.');
            }
        } catch (error) {
            console.error('Error sending interest:', error);
            showFeedback('error', 'Network Error', 'Please check your connection and try again.');
        }
    };

    const handleImageClick = (match) => {
        // Allow view if subscribed OR if the user is a connection (mutual accepted interest)
        if (hasSubscription || connectedUserIds.has(match._id)) {
            setSelectedProfile(match);
        } else {
            // Double check current user state before redirecting
            const subscriptionParams = user?.subscription || user?.user?.subscription;

            const planName = subscriptionParams?.plan?.toLowerCase() || '';

            const isActuallySubscribed =
                subscriptionParams?.isSubscribed === true ||
                ['gold', 'premium'].some(p => planName.includes(p));

            if (isActuallySubscribed) {
                // If state was stale but user is actually subscribed, allow it and update state
                setHasSubscription(true);
                setSelectedProfile(match);
            } else {
                router.push('/(dashboard)/(tabs)/settings');
            }
        }
    };

    const closeProfilePopup = () => {
        setSelectedProfile(null);
    };

    const MatchCard = memo(({ match }) => {
        const scaleAnim = new Animated.Value(1);

        const handlePressIn = () => {
            Animated.spring(scaleAnim, {
                toValue: 0.97,
                friction: 8,
                useNativeDriver: true,
            }).start();
        };

        const handlePressOut = () => {
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                useNativeDriver: true,
            }).start();
        };

        return (
            <Animated.View style={[styles.matchCard, { transform: [{ scale: scaleAnim }] }]}>
                <Pressable
                    onPress={() => handleImageClick(match)}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    style={[styles.cardContainer, { backgroundColor: 'transparent' }]}
                >
                    <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
                    <View style={{ flexDirection: 'row', flex: 1 }}>
                        {/* Left: Image Section */}
                        <View style={styles.imageSection}>
                            <Pressable onPress={() => handleImageClick(match)} style={styles.imagePressable}>
                                {match.profilePhoto ? (
                                    <>
                                        <Image
                                            source={{ uri: match.profilePhoto }}
                                            style={[styles.profileImage, !hasSubscription && styles.blurredImage]}
                                            resizeMode="cover"
                                        />
                                        {!hasSubscription && (
                                            <View style={styles.premiumOverlay}>
                                                <Lock size={20} color={Colors.white} />
                                            </View>
                                        )}
                                    </>
                                ) : (
                                    <View style={styles.noPhotoContainer}>
                                        <Camera size={28} color={Colors.textLight} />
                                    </View>
                                )}

                                {/* Corner Badges */}
                                {match.isVerified && (
                                    <View style={styles.verifiedCorner}>
                                        <CheckCircle size={14} color={Colors.white} fill={Colors.success} />
                                    </View>
                                )}

                                {match.isNew && (
                                    <View style={styles.newCorner}>
                                        <Sparkles size={12} color={Colors.white} />
                                    </View>
                                )}

                                {/* Compatibility Circle */}
                                <View style={styles.compatibilityCircle}>
                                    <Text style={styles.compatibilityNumber}>{match.compatibility}</Text>
                                    <Text style={styles.compatibilityPercent}>%</Text>
                                </View>
                            </Pressable>
                        </View>

                        {/* Right: Info Section */}
                        <View style={styles.infoSection}>
                            {/* Mutual Match Banner */}
                            {match.mutualMatch && (
                                <View style={styles.mutualBanner}>
                                    <Heart size={10} color={Colors.white} fill={Colors.white} />
                                    <Text style={styles.mutualText}>Mutual</Text>
                                </View>
                            )}

                            {/* Name & Age */}
                            <View style={styles.nameContainer}>
                                <Text style={styles.nameText} numberOfLines={1}>
                                    {hasSubscription ? match.name : maskFirstName(match.name)}
                                </Text>
                                <View style={styles.ageTag}>
                                    <Text style={styles.ageText}>{match.age}</Text>
                                </View>
                            </View>

                            {/* Details - Compact */}
                            <View style={styles.detailsCompact}>
                                <View style={styles.detailChip}>
                                    <MapPin size={12} color={Colors.primary} />
                                    <Text style={styles.chipText} numberOfLines={1}>{match.currentCity}</Text>
                                </View>
                                <View style={styles.detailChip}>
                                    <Briefcase size={12} color={Colors.primary} />
                                    <Text style={styles.chipText} numberOfLines={1}>{match.occupation || 'Professional'}</Text>
                                </View>
                                <View style={styles.detailChip}>
                                    <GraduationCap size={12} color={Colors.primary} />
                                    <Text style={styles.chipText} numberOfLines={1}>{match.education}</Text>
                                </View>
                            </View>

                            {/* Action Buttons - Interest button 60%, View 40% */}
                            <View style={styles.actionsRow}>
                                {match.mutualMatch ? (
                                    <>
                                        <Pressable
                                            onPressIn={handlePressIn}
                                            onPressOut={handlePressOut}
                                            style={styles.chatPillLarge}
                                        >
                                            <MessageCircle size={14} color={Colors.white} />
                                            <Text style={styles.pillText}>Chat</Text>
                                        </Pressable>
                                        <Pressable
                                            onPress={() => handleImageClick(match)}
                                            onPressIn={handlePressIn}
                                            onPressOut={handlePressOut}
                                            style={styles.viewPillSmall}
                                        >
                                            <Eye size={14} color={Colors.primary} />
                                        </Pressable>
                                    </>
                                ) : match.interestSent ? (
                                    <>
                                        <Pressable disabled style={styles.sentPillLarge}>
                                            <Heart size={14} color={Colors.danger} fill={Colors.danger} />
                                            <Text style={styles.pillTextMuted}>Sent</Text>
                                        </Pressable>
                                        <Pressable
                                            onPress={() => handleImageClick(match)}
                                            onPressIn={handlePressIn}
                                            onPressOut={handlePressOut}
                                            style={styles.viewPillSmall}
                                        >
                                            <Eye size={14} color={Colors.primary} />
                                        </Pressable>
                                    </>
                                ) : (
                                    <>
                                        <Pressable
                                            onPress={() => handleSendInterest(user?.id ? user.id : user.user.id, match._id)}
                                            disabled={checkingSubscription}
                                            onPressIn={handlePressIn}
                                            onPressOut={handlePressOut}
                                            style={styles.interestPillLarge}
                                        >
                                            {checkingSubscription ? (
                                                <ActivityIndicator size="small" color={Colors.white} />
                                            ) : (
                                                <>
                                                    <Heart size={14} color={Colors.white} />
                                                    <Text style={styles.pillText}>Interest</Text>
                                                </>
                                            )}
                                        </Pressable>
                                        <Pressable
                                            onPress={() => handleImageClick(match)}
                                            onPressIn={handlePressIn}
                                            onPressOut={handlePressOut}
                                            style={styles.viewPillSmall}
                                        >
                                            <Eye size={14} color={Colors.primary} />
                                        </Pressable>
                                    </>
                                )}
                            </View>
                        </View>
                    </View>
                </Pressable>
            </Animated.View>
        );
    });

    const EmptyState = memo(({ isLoading, isProfileIncomplete }) => (
        <View style={styles.emptyContainer}>
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingTitle}>Finding Matches...</Text>
                </View>
            ) : isProfileIncomplete ? (
                <View style={{ alignItems: 'center', gap: 16 }}>
                    <View style={styles.emptyIconContainer}>
                        <User size={40} color={Colors.primary} />
                    </View>
                    <Text style={styles.emptyTitle}>Incomplete Profile</Text>
                    <Text style={styles.emptySubtitle}>
                        You need to complete your profile to see matches.
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.push('/(dashboard)/profile')}
                        style={{
                            backgroundColor: Colors.primary,
                            paddingHorizontal: 24,
                            paddingVertical: 12,
                            borderRadius: 24,
                            marginTop: 8
                        }}
                    >
                        <Text style={{ color: Colors.white, fontWeight: '600', fontFamily: 'SpaceMono' }}>
                            Complete Profile
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    <View style={styles.emptyIconContainer}>
                        <Heart size={40} color={Colors.primary} />
                    </View>
                    <Text style={styles.emptyTitle}>No Matches Yet</Text>
                    <Text style={styles.emptySubtitle}>
                        Adjust your preferences or check back soon!
                    </Text>
                </>
            )}
        </View>
    ));

    const ProfilePopup = memo(({ profile, onClose, hasSubscription }) => {
        const [isImagePopupOpen, setIsImagePopupOpen] = useState(false);
        const slideAnim = new Animated.Value(0);

        useEffect(() => {
            Animated.spring(slideAnim, {
                toValue: 1,
                friction: 8,
                useNativeDriver: true,
            }).start();
        }, []);

        if (!profile) return null;

        return (
            <>
                <Modal animationType="none" transparent={true} visible={!!profile} onRequestClose={onClose}>
                    <Animated.View
                        style={[
                            styles.modalContainer,
                            {
                                transform: [
                                    {
                                        translateY: slideAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [100, 0],
                                        }),
                                    },
                                ],
                            },
                        ]}
                    >
                        <View style={styles.modalContent}>
                            <LinearGradient
                                colors={[Colors.primary, Colors.primaryLight]}
                                style={styles.modalHeader}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <View>
                                    <Text style={styles.modalTitle}>Profile Details</Text>
                                    <Text style={styles.modalSubtitle}>
                                        {profile.compatibility}% Match
                                    </Text>
                                </View>
                                <Pressable onPress={onClose} style={styles.closeButton}>
                                    <X size={24} color={Colors.white} />
                                </Pressable>
                            </LinearGradient>

                            <ScrollView style={styles.modalScrollView}>
                                <Pressable
                                    onPress={() => setIsImagePopupOpen(true)}
                                    style={styles.profileImageContainer}
                                >
                                    {profile.profilePhoto ? (
                                        <Image
                                            source={{ uri: profile.profilePhoto }}
                                            style={styles.fullProfileImage}
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <View style={styles.noProfileImage}>
                                            <Camera size={48} color={Colors.primary} />
                                            <Text style={styles.noProfileImageText}>No Profile Photo</Text>
                                        </View>
                                    )}
                                </Pressable>

                                <View style={styles.statsContainer}>
                                    <View style={styles.statItem}>
                                        <Text style={styles.statLabel}>Age</Text>
                                        <Text style={styles.statValue}>{profile.age}</Text>
                                    </View>
                                    <View style={styles.statItem}>
                                        <Text style={styles.statLabel}>Height</Text>
                                        <Text style={styles.statValue}>{profile.height}</Text>
                                    </View>
                                    <View style={styles.statItem}>
                                        <Text style={styles.statLabel}>City</Text>
                                        <Text style={styles.statValue} numberOfLines={1}>{profile.currentCity}</Text>
                                    </View>
                                </View>

                                <View style={styles.profileHeader}>
                                    <View style={styles.profileNameRow}>
                                        <Text style={styles.profileName}>
                                            {hasSubscription ? profile.name : maskFirstName(profile.name)}
                                        </Text>
                                        {profile.isVerified && (
                                            <View style={styles.profileVerifiedBadge}>
                                                <CheckCircle size={14} color={Colors.white} />
                                            </View>
                                        )}
                                    </View>
                                    <Text style={styles.profileOccupation}>
                                        {profile.occupation || 'Professional'}
                                    </Text>
                                </View>

                                {/* Personal Information */}
                                <View style={styles.sectionContainer}>
                                    <View style={styles.sectionHeader}>
                                        <User size={18} color={Colors.primary} />
                                        <Text style={styles.sectionTitle}>Personal Information</Text>
                                    </View>
                                    <View style={styles.sectionGrid}>
                                        <View style={styles.gridItem}>
                                            <Text style={styles.gridLabel}>Religion</Text>
                                            <Text style={styles.gridValue}>{profile.religion || 'N/A'}</Text>
                                        </View>
                                        <View style={styles.gridItem}>
                                            <Text style={styles.gridLabel}>Caste</Text>
                                            <Text style={styles.gridValue}>{profile.caste || 'N/A'}</Text>
                                        </View>
                                        <View style={styles.gridItem}>
                                            <Text style={styles.gridLabel}>Marital Status</Text>
                                            <Text style={styles.gridValue}>{profile.maritalStatus || 'N/A'}</Text>
                                        </View>
                                        <View style={styles.gridItem}>
                                            <Text style={styles.gridLabel}>Mother Tongue</Text>
                                            <Text style={styles.gridValue}>{profile.motherTongue || 'N/A'}</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Professional Information */}
                                <View style={styles.sectionContainer}>
                                    <View style={styles.sectionHeader}>
                                        <Briefcase size={18} color={Colors.primary} />
                                        <Text style={styles.sectionTitle}>Professional Details</Text>
                                    </View>
                                    <View style={styles.sectionGrid}>
                                        <View style={styles.gridItem}>
                                            <Text style={styles.gridLabel}>Education</Text>
                                            <Text style={styles.gridValue}>{profile.education || 'N/A'}</Text>
                                        </View>
                                        <View style={styles.gridItem}>
                                            <Text style={styles.gridLabel}>Occupation</Text>
                                            <Text style={styles.gridValue}>{profile.occupation || 'N/A'}</Text>
                                        </View>
                                        <View style={styles.gridItem}>
                                            <Text style={styles.gridLabel}>Income</Text>
                                            <Text style={styles.gridValue}>{profile.income || 'N/A'}</Text>
                                        </View>
                                        <View style={styles.gridItem}>
                                            <Text style={styles.gridLabel}>Company</Text>
                                            <Text style={styles.gridValue}>{profile.company || 'N/A'}</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* About */}
                                {profile.bio && (
                                    <View style={styles.sectionContainer}>
                                        <View style={styles.sectionHeader}>
                                            <Star size={18} color={Colors.primary} />
                                            <Text style={styles.sectionTitle}>About</Text>
                                        </View>
                                        <View style={styles.aboutContainer}>
                                            <Text style={styles.aboutText}>{profile.bio}</Text>
                                        </View>
                                    </View>
                                )}

                                <View style={styles.profileActions}>
                                    {profile.mutualMatch ? (
                                        <Pressable style={styles.chatButtonLarge}>
                                            <MessageCircle size={16} color={Colors.white} />
                                            <Text style={styles.whiteButtonText}>Start Chat</Text>
                                        </Pressable>
                                    ) : profile.interestSent ? (
                                        <Pressable style={styles.sentButtonLarge} disabled={true}>
                                            <Heart size={16} color={Colors.textSecondary} fill={Colors.danger} />
                                            <Text style={styles.disabledButtonText}>Interest Sent</Text>
                                        </Pressable>
                                    ) : (
                                        <Pressable
                                            style={styles.interestButtonLarge}
                                            onPress={() => handleSendInterest(user?.id ? user.id : user.user.id, profile._id)}
                                            disabled={checkingSubscription}
                                        >
                                            {checkingSubscription ? (
                                                <ActivityIndicator size="small" color={Colors.white} />
                                            ) : (
                                                <>
                                                    <Heart size={16} color={Colors.white} />
                                                    <Text style={styles.whiteButtonText}>Send Interest</Text>
                                                </>
                                            )}
                                        </Pressable>
                                    )}
                                </View>
                            </ScrollView>
                        </View>
                    </Animated.View>
                </Modal>

                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={isImagePopupOpen}
                    onRequestClose={() => setIsImagePopupOpen(false)}
                >
                    <View style={styles.fullImageModal}>
                        <Pressable
                            style={styles.fullImageCloseButton}
                            onPress={() => setIsImagePopupOpen(false)}
                        >
                            <X size={32} color={Colors.white} />
                        </Pressable>
                        {profile.profilePhoto ? (
                            <Image
                                source={{ uri: profile.profilePhoto }}
                                style={styles.fullScreenImage}
                                resizeMode="contain"
                            />
                        ) : (
                            <View style={styles.noFullImage}>
                                <Camera size={64} color={Colors.primary} />
                                <Text style={styles.noFullImageText}>No Profile Photo</Text>
                            </View>
                        )}
                    </View>
                </Modal>
            </>
        );
    });

    return (
        <View style={styles.container}>
            {/* Compact Search */}
            <View style={styles.searchWrapper}>
                <View style={styles.searchPill}>
                    <Search size={16} color={Colors.primary} />
                    <TextInput
                        placeholder="Search city..."
                        placeholderTextColor={Colors.textLight}
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery ? (
                        <Pressable onPress={() => setSearchQuery('')}>
                            <X size={16} color={Colors.textLight} />
                        </Pressable>
                    ) : null}
                </View>
            </View>

            {/* Compact Tabs */}
            <View style={styles.tabsBubble}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabsScroll}
                >
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <Pressable
                                key={tab.id}
                                onPress={() => {
                                    if (tab.id === 'filter') {
                                        setShowFilterModal(true);
                                    } else {
                                        setActiveTab(tab.id);
                                    }
                                }}
                                style={[styles.bubbleTab, isActive && styles.bubbleTabActive]}
                            >
                                <Icon size={14} color={isActive ? Colors.white : Colors.primary} />
                                <Text style={[styles.bubbleText, isActive && styles.bubbleTextActive]} >
                                    {tab.label}
                                </Text>
                                {tab.count > 0 && (
                                    <View style={[styles.bubbleCount, isActive && styles.bubbleCountActive]}>
                                        <Text style={[styles.countText, isActive && styles.countTextActive]}>
                                            {tab.count}
                                        </Text>
                                    </View>
                                )}
                            </Pressable>
                        );
                    })}
                </ScrollView>
            </View>

            {/* Sort Dropdown */}
            <Animated.View
                style={[
                    styles.sortWrapper,
                    {
                        transform: [{
                            translateY: filterAnimation.interpolate({
                                inputRange: [0, 1],
                                outputRange: [-50, 0],
                            }),
                        }],
                        opacity: filterAnimation,
                    },
                ]}
            >
                <Pressable
                    onPress={() =>
                        setSortBy((prev) =>
                            prev === 'compatibility' ? 'newest' :
                                prev === 'newest' ? 'recently_active' :
                                    prev === 'recently_active' ? 'age_low' :
                                        prev === 'age_low' ? 'age_high' : 'compatibility'
                        )
                    }
                    style={styles.sortPill}
                >
                    <ArrowUpDown size={12} color={Colors.primary} />
                    <Text style={styles.sortText}>
                        {sortBy === 'compatibility' ? 'Best' :
                            sortBy === 'newest' ? 'New' :
                                sortBy === 'recently_active' ? 'Active' :
                                    sortBy === 'age_low' ? 'Age ↑' : 'Age ↓'}
                    </Text>
                </Pressable>
            </Animated.View>

            {/* Single Column List */}
            {filteredMatches.length > 0 ? (
                <FlatList
                    data={filteredMatches}
                    renderItem={({ item }) => <MatchCard match={item} />}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 80 }]}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={<View style={{ height: showQuickFilters ? 50 : 4 }} />}
                />
            ) : (
                <EmptyState isLoading={isLoading} isProfileIncomplete={isProfileIncomplete} />
            )}

            {selectedProfile && (
                <ProfilePopup
                    profile={selectedProfile}
                    onClose={closeProfilePopup}
                    hasSubscription={hasSubscription}
                />
            )}
            {/* Filter Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showFilterModal}
                onRequestClose={() => setShowFilterModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: Colors.textPrimary }]}>Filters</Text>
                            <Pressable onPress={() => setShowFilterModal(false)}>
                                <X size={24} color={Colors.textPrimary} />
                            </Pressable>
                        </View>
                        <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
                            <View style={{ padding: 20, gap: 24 }}>

                                {/* Section 1: Basic Details */}
                                <View>
                                    <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.primary, marginBottom: 12, fontFamily: 'SpaceMono' }}>
                                        Basic Details
                                    </Text>

                                    {/* Gender */}
                                    <View style={{ marginBottom: 16 }}>
                                        <Text style={styles.gridLabel}>Gender</Text>
                                        <View style={{ flexDirection: 'row', gap: 10 }}>
                                            {['All', 'Male', 'Female'].map(g => (
                                                <TouchableOpacity
                                                    key={g}
                                                    onPress={() => setFilters(prev => ({ ...prev, gender: g }))}
                                                    style={{
                                                        paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
                                                        backgroundColor: filters.gender === g ? Colors.primary : Colors.secondaryLight,
                                                    }}
                                                >
                                                    <Text style={{ color: filters.gender === g ? Colors.white : Colors.textSecondary, fontWeight: '600' }}>{g}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>

                                    {/* Age Range */}
                                    <View style={{ marginBottom: 16 }}>
                                        <Text style={styles.gridLabel}>Age Range</Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                            <TextInput
                                                style={[styles.searchInput, { borderWidth: 1, borderColor: Colors.borderLight, borderRadius: 12, padding: 12, flex: 1, textAlign: 'center' }]}
                                                placeholder="Min"
                                                keyboardType="numeric"
                                                value={filters.ageRange[0]?.toString() || ''}
                                                onChangeText={(t) => setFilters(prev => ({ ...prev, ageRange: [parseInt(t) || 18, prev.ageRange[1]] }))}
                                            />
                                            <Text>-</Text>
                                            <TextInput
                                                style={[styles.searchInput, { borderWidth: 1, borderColor: Colors.borderLight, borderRadius: 12, padding: 12, flex: 1, textAlign: 'center' }]}
                                                placeholder="Max"
                                                keyboardType="numeric"
                                                value={filters.ageRange[1]?.toString() || ''}
                                                onChangeText={(t) => setFilters(prev => ({ ...prev, ageRange: [prev.ageRange[0], parseInt(t) || 60] }))}
                                            />
                                        </View>
                                    </View>

                                    {/* Location */}
                                    <View style={{ marginBottom: 16 }}>
                                        <Text style={styles.gridLabel}>Location (City/District)</Text>
                                        <TextInput
                                            style={[styles.searchInput, { borderWidth: 1, borderColor: Colors.borderLight, borderRadius: 12, padding: 12 }]}
                                            placeholder="Enter city or district..."
                                            value={filters.location || ''}
                                            onChangeText={(t) => setFilters(prev => ({ ...prev, location: t }))}
                                        />
                                    </View>

                                    {/* Marital Status */}
                                    <View>
                                        <Text style={styles.gridLabel}>Marital Status</Text>
                                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                            {['Never Married', 'Divorced', 'Widowed', 'Separated'].map(status => {
                                                const isSelected = filters.maritalStatus.includes(status);
                                                return (
                                                    <TouchableOpacity
                                                        key={status}
                                                        onPress={() => {
                                                            setFilters(prev => {
                                                                const newStatus = isSelected
                                                                    ? prev.maritalStatus.filter(s => s !== status)
                                                                    : [...prev.maritalStatus, status];
                                                                return { ...prev, maritalStatus: newStatus };
                                                            });
                                                        }}
                                                        style={{
                                                            paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                                                            borderWidth: 1,
                                                            borderColor: isSelected ? Colors.primary : Colors.borderLight,
                                                            backgroundColor: isSelected ? Colors.secondaryLight : Colors.white
                                                        }}
                                                    >
                                                        <Text style={{ color: isSelected ? Colors.primary : Colors.textSecondary, fontSize: 13 }}>{status}</Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    </View>
                                </View>

                                <View style={{ height: 1, backgroundColor: Colors.borderLight }} />

                                {/* Section 2: Community */}
                                <View>
                                    <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.primary, marginBottom: 12, fontFamily: 'SpaceMono' }}>
                                        Community
                                    </Text>
                                    <View style={{ flexDirection: 'row', gap: 10 }}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.gridLabel}>Caste</Text>
                                            <TextInput
                                                style={[styles.searchInput, { borderWidth: 1, borderColor: Colors.borderLight, borderRadius: 12, padding: 12 }]}
                                                placeholder="e.g. Mali"
                                                value={filters.caste || ''}
                                                onChangeText={(t) => setFilters(prev => ({ ...prev, caste: t }))}
                                            />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.gridLabel}>Sub-caste</Text>
                                            <TextInput
                                                style={[styles.searchInput, { borderWidth: 1, borderColor: Colors.borderLight, borderRadius: 12, padding: 12 }]}
                                                placeholder="e.g. Phul Mali"
                                                value={filters.subCaste || ''}
                                                onChangeText={(t) => setFilters(prev => ({ ...prev, subCaste: t }))}
                                            />
                                        </View>
                                    </View>
                                </View>

                                <View style={{ height: 1, backgroundColor: Colors.borderLight }} />

                                {/* Section 3: Education & Work */}
                                <View>
                                    <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.primary, marginBottom: 12, fontFamily: 'SpaceMono' }}>
                                        Education & Work
                                    </Text>
                                    <View style={{ marginBottom: 16 }}>
                                        <Text style={styles.gridLabel}>Education Level</Text>
                                        <TextInput
                                            style={[styles.searchInput, { borderWidth: 1, borderColor: Colors.borderLight, borderRadius: 12, padding: 12 }]}
                                            placeholder="e.g. Graduate, BE, MBA..."
                                            value={filters.education || ''}
                                            onChangeText={(t) => setFilters(prev => ({ ...prev, education: t }))}
                                        />
                                    </View>
                                    <View>
                                        <Text style={styles.gridLabel}>Occupation</Text>
                                        <TextInput
                                            style={[styles.searchInput, { borderWidth: 1, borderColor: Colors.borderLight, borderRadius: 12, padding: 12 }]}
                                            placeholder="e.g. Service, Business..."
                                            value={filters.occupation || ''}
                                            onChangeText={(t) => setFilters(prev => ({ ...prev, occupation: t }))}
                                        />
                                    </View>
                                </View>

                                <View style={{ height: 1, backgroundColor: Colors.borderLight }} />

                                {/* Section 4: Lifestyle */}
                                <View>
                                    <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.primary, marginBottom: 12, fontFamily: 'SpaceMono' }}>
                                        Lifestyle
                                    </Text>
                                    <View>
                                        <Text style={styles.gridLabel}>Diet</Text>
                                        <View style={{ flexDirection: 'row', gap: 10 }}>
                                            {['Any', 'Veg', 'Non-Veg'].map(d => (
                                                <TouchableOpacity
                                                    key={d}
                                                    onPress={() => setFilters(prev => ({ ...prev, diet: d }))}
                                                    style={{
                                                        paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
                                                        backgroundColor: filters.diet === d ? Colors.primary : Colors.secondaryLight,
                                                    }}
                                                >
                                                    <Text style={{ color: filters.diet === d ? Colors.white : Colors.textSecondary, fontWeight: '600' }}>{d}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                </View>

                                <View style={{ height: 1, backgroundColor: Colors.borderLight }} />

                                {/* Section 5: Quick Filters */}
                                <View>
                                    <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.primary, marginBottom: 12, fontFamily: 'SpaceMono' }}>
                                        Quick Filters
                                    </Text>
                                    <View style={{ gap: 16 }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                <Camera size={20} color={Colors.textPrimary} />
                                                <Text style={styles.gridLabel}>With Photo Only</Text>
                                            </View>
                                            <Switch
                                                value={filters.withPhoto}
                                                onValueChange={(v) => setFilters(prev => ({ ...prev, withPhoto: v }))}
                                                trackColor={{ false: Colors.borderLight, true: Colors.primary }}
                                            />
                                        </View>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                <Clock size={20} color={Colors.textPrimary} />
                                                <Text style={styles.gridLabel}>Recently Active</Text>
                                            </View>
                                            <Switch
                                                value={filters.activeRecently}
                                                onValueChange={(v) => setFilters(prev => ({ ...prev, activeRecently: v }))}
                                                trackColor={{ false: Colors.borderLight, true: Colors.primary }}
                                            />
                                        </View>
                                    </View>
                                </View>

                            </View>
                        </ScrollView>

                        <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: Colors.borderLight }}>
                            <TouchableOpacity
                                style={styles.completionGoButton}
                                onPress={() => setShowFilterModal(false)}
                            >
                                <Text style={styles.completionGoButtonText}>Apply Filters</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.completionLaterButton, { marginTop: 8 }]}
                                onPress={() => {
                                    setFilters(quickFilters); // Reset
                                }}
                            >
                                <Text style={styles.completionLaterText}>Clear All</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {showCompletionModal && (
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={showCompletionModal}
                    // Prevent closing via hardware back button
                    onRequestClose={() => { }}
                >
                    <View style={styles.completionOverlay}>
                        <View style={styles.completionModalContent}>
                            <View style={styles.completionIconContainer}>
                                <Sparkles size={48} color={Colors.primary} />
                            </View>
                            <Text style={styles.completionTitle}>Complete Your Profile</Text>
                            <Text style={styles.completionSubtitle}>
                                To see matches, please complete the following fields:
                            </Text>

                            {missingFields.length > 0 && (
                                <View style={{ width: '100%', marginBottom: 20 }}>
                                    {missingFields.map((field, index) => (
                                        <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                                            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.danger, marginRight: 8 }} />
                                            <Text style={{ fontSize: 14, color: Colors.textSecondary, fontFamily: 'SpaceMono', textTransform: 'capitalize' }}>
                                                {field.replace(/([A-Z])/g, ' $1').trim()}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}

                            <TouchableOpacity
                                style={styles.completionGoButton}
                                onPress={() => {
                                    setShowCompletionModal(false);
                                    router.push('/(dashboard)/profile');
                                }}
                            >
                                <Text style={styles.completionGoButtonText}>Go to Profile</Text>
                            </TouchableOpacity>
                            {/* Removed "Maybe Later" to enforce completion */}
                        </View>
                    </View>
                </Modal>
            )}
            {/* Feedback Modal */}
            <FeedbackModal
                visible={feedbackVisible}
                type={feedbackConfig.type}
                title={feedbackConfig.title}
                message={feedbackConfig.message}
                actions={feedbackConfig.actions}
                onClose={() => setFeedbackVisible(false)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },

    // Compact Header - No Background
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.textPrimary,
        fontFamily: 'SpaceMono',
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    headerButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.secondaryLight,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Compact Search
    searchWrapper: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: Colors.white,
    },
    searchPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 8,
        gap: 8,
        borderWidth: 1,
        borderColor: Colors.borderLight,
    },
    searchInput: {
        flex: 1,
        fontSize: 13,
        color: Colors.textPrimary,
        fontFamily: 'SpaceMono',
    },

    // Compact Tabs
    tabsBubble: {
        backgroundColor: Colors.white,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
    },
    tabsScroll: {
        paddingHorizontal: 16,
        gap: 8,
    },
    bubbleTab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 16,
        backgroundColor: Colors.secondaryLight,
        gap: 5,
    },
    bubbleTabActive: {
        backgroundColor: Colors.primary,
    },
    bubbleText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.primary,
        fontFamily: 'SpaceMono',
    },
    bubbleTextActive: {
        color: Colors.white,
    },
    bubbleCount: {
        backgroundColor: Colors.white,
        borderRadius: 8,
        paddingHorizontal: 6,
        paddingVertical: 1,
        minWidth: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bubbleCountActive: {
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    countText: {
        fontSize: 10,
        fontWeight: '700',
        color: Colors.primary,
        fontFamily: 'SpaceMono',
    },
    countTextActive: {
        color: Colors.white,
    },

    // Compact Sort
    sortWrapper: {
        position: 'absolute',
        top: 150,
        left: 16,
        zIndex: 10,
    },
    sortPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 5,
        borderWidth: 1,
        borderColor: Colors.borderLight,
    },
    sortText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.primary,
        fontFamily: 'SpaceMono',
    },

    // Compact Cards
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    matchCard: {
        width: '100%',
        marginBottom: 12,
    },
    cardContainer: {
        flexDirection: 'row',
        backgroundColor: Colors.white,
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.borderLight,
    },

    // Image Section
    imageSection: {
        width: '40%',
        height: 180,
    },
    imagePressable: {
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    profileImage: {
        width: '100%',
        height: '100%',
    },
    blurredImage: {
        opacity: 0.7,
    },
    premiumOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    noPhotoContainer: {
        width: '100%',
        height: '100%',
        backgroundColor: Colors.backgroundTertiary,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Corner Badges
    verifiedCorner: {
        position: 'absolute',
        top: 6,
        left: 6,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 10,
        padding: 3,
    },
    newCorner: {
        position: 'absolute',
        top: 6,
        right: 6,
        backgroundColor: Colors.warning,
        borderRadius: 10,
        padding: 3,
    },

    // Compatibility Circle
    compatibilityCircle: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2.5,
        borderColor: Colors.primary,
    },
    compatibilityNumber: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.primary,
        fontFamily: 'SpaceMono',
        lineHeight: 18,
    },
    compatibilityPercent: {
        fontSize: 9,
        fontWeight: '600',
        color: Colors.primary,
        fontFamily: 'SpaceMono',
    },

    // Info Section
    infoSection: {
        flex: 1,
        padding: 12,
        justifyContent: 'space-between',
    },
    mutualBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: Colors.primary,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
        gap: 3,
        marginBottom: 6,
    },
    mutualText: {
        fontSize: 9,
        fontWeight: '700',
        color: Colors.white,
        fontFamily: 'SpaceMono',
    },

    // Name & Age
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    nameText: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.textPrimary,
        fontFamily: 'SpaceMono',
        flex: 1,
    },
    ageTag: {
        backgroundColor: Colors.secondaryLight,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    ageText: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.primary,
        fontFamily: 'SpaceMono',
    },

    // Compact Details
    detailsCompact: {
        gap: 5,
        marginBottom: 10,
    },
    detailChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    chipText: {
        fontSize: 11,
        color: Colors.textSecondary,
        fontFamily: 'SpaceMono',
        flex: 1,
    },

    // Action Buttons - 60% Interest, 40% View
    actionsRow: {
        flexDirection: 'row',
        gap: 6,
    },
    interestPillLarge: {
        flex: 0.65,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primary,
        paddingVertical: 9,
        borderRadius: 18,
        gap: 5,
    },
    chatPillLarge: {
        flex: 0.65,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.info,
        paddingVertical: 9,
        borderRadius: 18,
        gap: 5,
    },
    sentPillLarge: {
        flex: 0.65,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.backgroundTertiary,
        paddingVertical: 9,
        borderRadius: 18,
        gap: 5,
        borderWidth: 1,
        borderColor: Colors.borderLight,
    },
    viewPillSmall: {
        flex: 0.35,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.secondaryLight,
        paddingVertical: 9,
        borderRadius: 18,
    },
    pillText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.white,
        fontFamily: 'SpaceMono',
    },
    pillTextMuted: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.textSecondary,
        fontFamily: 'SpaceMono',
    },

    // Empty State
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyIconContainer: {
        backgroundColor: Colors.secondaryLight,
        padding: 18,
        borderRadius: 40,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 8,
        textAlign: 'center',
        fontFamily: 'SpaceMono',
    },
    emptySubtitle: {
        fontSize: 13,
        color: Colors.textSecondary,
        textAlign: 'center',
        fontFamily: 'SpaceMono',
        lineHeight: 18,
    },
    loadingContainer: {
        alignItems: 'center',
    },
    loadingTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginTop: 12,
        fontFamily: 'SpaceMono',
    },

    // Modal
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '90%',
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.white,
        fontFamily: 'SpaceMono',
    },
    modalSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.9)',
        fontFamily: 'SpaceMono',
    },
    closeButton: {
        padding: 4,
    },
    modalScrollView: {
        paddingBottom: 20,
    },
    profileImageContainer: {
        width: '100%',
        height: 300,
    },
    fullProfileImage: {
        width: '100%',
        height: '100%',
    },
    noProfileImage: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.backgroundTertiary,
    },
    noProfileImageText: {
        fontSize: 16,
        color: Colors.textSecondary,
        marginTop: 12,
        fontFamily: 'SpaceMono',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginBottom: 4,
        fontFamily: 'SpaceMono',
    },
    statValue: {
        fontSize: 15,
        fontWeight: '700',
        color: Colors.textPrimary,
        fontFamily: 'SpaceMono',
    },
    profileHeader: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    profileNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 6,
    },
    profileName: {
        fontSize: 22,
        fontWeight: '700',
        color: Colors.textPrimary,
        fontFamily: 'SpaceMono',
    },
    profileVerifiedBadge: {
        backgroundColor: Colors.success,
        borderRadius: 12,
        padding: 4,
    },
    profileOccupation: {
        fontSize: 15,
        color: Colors.textSecondary,
        fontFamily: 'SpaceMono',
    },
    sectionContainer: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
        gap: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.textPrimary,
        fontFamily: 'SpaceMono',
    },
    sectionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    gridItem: {
        width: '47%',
    },
    gridLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginBottom: 4,
        fontFamily: 'SpaceMono',
    },
    gridValue: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textPrimary,
        fontFamily: 'SpaceMono',
    },
    aboutContainer: {
        backgroundColor: Colors.backgroundTertiary,
        borderRadius: 12,
        padding: 14,
    },
    aboutText: {
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 22,
        fontFamily: 'SpaceMono',
    },
    profileActions: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
    },
    chatButtonLarge: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.info,
        paddingVertical: 14,
        borderRadius: 25,
        gap: 8,
    },
    interestButtonLarge: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: Colors.primary,
        paddingVertical: 14,
        borderRadius: 25,
        gap: 8,
    },
    sentButtonLarge: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.backgroundTertiary,
        paddingVertical: 14,
        borderRadius: 25,
        gap: 8,
        borderWidth: 1,
        borderColor: Colors.borderLight,
    },
    whiteButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.white,
        fontFamily: 'SpaceMono',
    },
    disabledButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textSecondary,
        fontFamily: 'SpaceMono',
    },
    fullImageModal: {
        flex: 1,
        backgroundColor: '#000000',
        justifyContent: 'center',
    },
    fullImageCloseButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 10,
    },
    fullScreenImage: {
        width: '100%',
        height: '100%',
    },
    noFullImage: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noFullImageText: {
        fontSize: 16,
        color: Colors.white,
        marginTop: 12,
        fontFamily: 'SpaceMono',
    },

    // Completion Modal
    completionOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    completionModalContent: {
        width: '100%',
        backgroundColor: Colors.white,
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    completionIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.secondaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    completionTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 12,
        textAlign: 'center',
        fontFamily: 'SpaceMono',
    },
    completionSubtitle: {
        fontSize: 15,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: 28,
        lineHeight: 22,
        fontFamily: 'SpaceMono',
    },
    completionGoButton: {
        width: '100%',
        backgroundColor: Colors.primary,
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        marginBottom: 16,
    },
    completionGoButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '700',
        fontFamily: 'SpaceMono',
    },
    completionLaterButton: {
        paddingVertical: 8,
    },
    completionLaterText: {
        color: Colors.textSecondary,
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'SpaceMono',
    },
});

export default MatchesPage;

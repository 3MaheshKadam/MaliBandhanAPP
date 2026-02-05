import React, { useState, useEffect } from 'react';
import { BlurView } from 'expo-blur';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Switch,
  Dimensions,
  Animated,
  Easing,
  StyleSheet,
  Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  User,
  Heart,
  Eye,
  CheckCircle,
  Edit3,
  Crown,
  Camera,
  MapPin,
  Calendar,
  Award,
  Star,
  Gift,
  Sparkles,
  Settings,
  EyeOff,
  UserCheck,
  Upload,
  Briefcase,
  GraduationCap,
  Home,
  Users,
  Search,
  Clock,
  Bell,
  Shield,
  ChevronRight,
  Plus,
  X,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  XCircle,
  Phone,
  ArrowDown
} from 'lucide-react-native';
import { useSession } from '../../../context/SessionContext';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { Config } from '@/constants/Config';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const ProfileSectionHeader = ({ title, completion, onPress, isExpanded }) => {
  const rotateAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: isExpanded ? 1 : 0,
      duration: 200,
      easing: Easing.ease,
      useNativeDriver: true
    }).start();
  }, [isExpanded]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.borderLight
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{
            width: 48,
            height: 24,
            borderRadius: 8,
            backgroundColor: Colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12
          }}>
            <Text style={{ color: Colors.white, fontWeight: 'bold', fontSize: 12, fontFamily: 'SpaceMono' }}>{completion}%</Text>
          </View>
          <Text style={{ color: Colors.textPrimary, fontWeight: '600', fontSize: 16, fontFamily: 'SpaceMono' }}>{title}</Text>
        </View>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <ArrowDown size={20} color={Colors.textSecondary} />
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

const FormInput = ({ label, value, onChange, placeholder, type = 'text', options = [], required }) => {
  if (type === 'select' || type === 'checkbox') {
    return (
      <View style={{ marginBottom: 20 }}>
        <Text style={{ color: Colors.textSecondary, marginBottom: 8, fontSize: 14, fontFamily: 'SpaceMono' }}>
          {label}
          {required && <Text style={{ color: Colors.danger }}>*</Text>}
        </Text>
        <View style={{
          borderWidth: 1,
          borderColor: Colors.borderLight,
          borderRadius: 12,
          overflow: 'hidden'
        }}>
          <Picker
            selectedValue={type === 'checkbox' ? (value ? 'Yes' : 'No') : value}
            onValueChange={(val) => onChange(type === 'checkbox' ? val === 'Yes' : val)}
            style={{
              height: 50,
              color: Colors.textPrimary,
              backgroundColor: Colors.backgroundSecondary,
              fontFamily: 'SpaceMono'
            }}
            dropdownIconColor={Colors.primary}
          >
            <Picker.Item label={`Select ${label}`} value="" />
            {type === 'checkbox' ? (
              <>
                <Picker.Item label="No" value="No" />
                <Picker.Item label="Yes" value="Yes" />
              </>
            ) : (
              options.map((option, index) => (
                <Picker.Item key={index} label={option} value={option} />
              ))
            )}
          </Picker>
        </View>
      </View>
    );
  }

  if (type === 'date') {
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Parse current value or use today
    const dateValue = value ? new Date(value) : new Date();
    // Validate date (if invalid string, fallback to today)
    const validDate = isNaN(dateValue.getTime()) ? new Date() : dateValue;

    const onDateChange = (event, selectedDate) => {
      setShowDatePicker(Platform.OS === 'ios');
      if (selectedDate) {
        // Format as YYYY-MM-DD for consistency
        const formattedDate = selectedDate.toISOString().split('T')[0];
        onChange(formattedDate);
      }
    };

    return (
      <View style={{ marginBottom: 20 }}>
        <Text style={{ color: Colors.textSecondary, marginBottom: 8, fontSize: 14, fontFamily: 'SpaceMono' }}>
          {label}
          {required && <Text style={{ color: Colors.danger }}>*</Text>}
        </Text>

        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: 16,
            borderWidth: 1,
            borderColor: Colors.borderLight,
            borderRadius: 12,
            backgroundColor: Colors.backgroundSecondary,
          }}
        >
          <Text style={{
            color: value ? Colors.textPrimary : Colors.textLight,
            fontFamily: 'SpaceMono',
            fontSize: 16
          }}>
            {value || placeholder || 'Select Date'}
          </Text>
          <Calendar size={20} color={Colors.textSecondary} />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={validDate}
            mode="date"
            is24Hour={true}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
            maximumDate={new Date()} // DOB cannot be in future
          />
        )}
      </View>
    );
  }

  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ color: Colors.textSecondary, marginBottom: 8, fontSize: 14, fontFamily: 'SpaceMono' }}>
        {label}
        {required && <Text style={{ color: Colors.danger }}>*</Text>}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={Colors.textLight}
        style={{
          width: '100%',
          padding: 16,
          borderWidth: 1,
          borderColor: Colors.borderLight,
          borderRadius: 12,
          color: Colors.textPrimary,
          backgroundColor: Colors.backgroundSecondary,
          fontFamily: 'SpaceMono'
        }}
        keyboardType={type === 'number' ? 'numeric' : type === 'email' ? 'email-address' : 'default'}
      />
    </View>
  );
};

const VerificationBadge = ({ status }) => {
  const statusConfig = {
    Unverified: {
      bg: Colors.backgroundTertiary,
      text: Colors.textSecondary,
      icon: null,
      label: 'Unverified'
    },
    Pending: {
      bg: Colors.lightWarning,
      text: Colors.warning,
      icon: <Clock size={14} color={Colors.warning} style={{ marginRight: 4 }} />,
      label: 'Pending Verification'
    },
    Verified: {
      bg: Colors.lightSuccess,
      text: Colors.success,
      icon: <Shield size={14} color={Colors.success} style={{ marginRight: 4 }} />,
      label: 'Verified Profile'
    },
    Rejected: {
      bg: Colors.lightDanger,
      text: Colors.danger,
      icon: <XCircle size={14} color={Colors.danger} style={{ marginRight: 4 }} />,
      label: 'Verification Rejected'
    }
  };

  const config = statusConfig[status] || statusConfig.Unverified;

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: config.bg
    }}>
      {config.icon}
      <Text style={{ color: config.text, fontSize: 12, fontWeight: '500', fontFamily: 'SpaceMono' }}>{config.label}</Text>
    </View>
  );
};

export default function MyProfilePage() {
  const { user } = useSession();
  const router = useRouter();
  const [formSections, setFormSections] = useState([]);
  const [formData, setFormData] = useState({});
  const [photos, setPhotos] = useState([
    { id: 1, url: null, isPrimary: true },
    { id: 2, url: null, isPrimary: false },
    { id: 3, url: null, isPrimary: false },
    { id: 4, url: null, isPrimary: false },
  ]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('');
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState('Unverified');
  const [adminWillFill, setAdminWillFill] = useState(false);
  const [showFormFillChoice, setShowFormFillChoice] = useState(false);
  const [dontAskAgain, setDontAskAgain] = useState(false);
  const [showCompletionUpdate, setShowCompletionUpdate] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const insets = useSafeAreaInsets();

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideUpAnim = React.useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true
      })
    ]).start();
  }, []);

  const fieldNameMappings = {
    'Full Name': 'name',
    'Height': 'height',
    'Weight': 'weight',
    'Date of Birth': 'dob',
    'Marital Status': 'maritalStatus',
    'Mother Tongue': 'motherTongue',
    'Current City': 'currentCity',
    'Email Address': 'email',
    'Permanent Address': 'permanentAddress',
    'Gender': 'gender',
    'Blood Group': 'bloodGroup',
    'Wears Lens': 'wearsLens',
    'Complexion': 'complexion',
    'Highest Education': 'education',
    'Occupation': 'occupation',
    'Field of Study': 'fieldOfStudy',
    'Company': 'company',
    'College/University': 'college',
    'Annual Income': 'income',
    "Father's Name": 'fatherName',
    "Mother's Name": 'mother',
    "Parent's Residence City": 'parentResidenceCity',
    "Number of Brothers": 'brothers',
    "Number of Sisters": 'sisters',
    "Married Brothers": 'marriedBrothers',
    "Married Sisters": 'marriedSisters',
    "Native District": 'nativeDistrict',
    "Native City": 'nativeCity',
    "Family Wealth": 'familyWealth',
    "Mama's Surname": 'mamaSurname',
    "Parent's Occupation": 'parentOccupation',
    "Relative Surnames": 'relativeSurname',
    "Religion": 'religion',
    "Sub Caste": 'subCaste',
    "Caste": 'caste',
    "Gothra": 'gothra',
    "Rashi": 'rashi',
    "Nadi": 'nadi',
    "Nakshira": 'nakshira',
    "Mangal Dosha": 'mangal',
    "Charan": 'charan',
    "Birth Place": 'birthPlace',
    "Birth Time": 'birthTime',
    "Gan": 'gan',
    "Gotra Devak": 'gotraDevak',
    "Expected Caste": 'expectedCaste',
    "Preferred City": 'preferredCity',
    "Expected Age Difference": 'expectedAgeDifference',
    "Expected Education": 'expectedEducation',
    "Accept Divorcee": 'divorcee',
    "Expected Height": 'expectedHeight',
    "Expected Income": 'expectedIncome',
    "Expected Sub Caste": 'expectedSubCaste',
    "Partner Working Status": 'expectedWorkingStatus'
  };

  const normalizeFieldName = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '');
  };

  const loadData = React.useCallback(async () => {
    try {
      if (!formSections.length) setIsLoading(true); // Show full loader only if no data

      // Fetch form sections structure
      const sectionsRes = await fetch(`${Config.API_URL}/api/admin/form-sections`, {
        credentials: 'include'
      });
      const sectionsData = await sectionsRes.json();

      const transformedSections = sectionsData.map(section => ({
        ...section,
        id: section._id,
        fields: section.fields.map(field => ({
          ...field,
          name: field.name,
          label: field.label,
          type: field.type,
          required: field.required,
          options: field.options || [],
          placeholder: field.placeholder || ''
        }))
      }));

      setFormSections(transformedSections);

      // Only set initial expanded state if not already set
      setExpandedSections(prev => {
        if (Object.keys(prev).length === 0) {
          const initialExpanded = {};
          transformedSections.forEach(section => {
            initialExpanded[section._id] = section._id === transformedSections[0]?._id;
          });
          return initialExpanded;
        }
        return prev;
      });

      if (!activeTab && transformedSections.length > 0) {
        setActiveTab(transformedSections[0]?._id);
      }

      // Fetch user data
      const userRes = await fetch(`${Config.API_URL}/api/users/me`, {
        credentials: 'include'
      });
      const userData = await userRes.json();

      // Create initial form data state
      const initialFormData = {};
      transformedSections.forEach(section => {
        section.fields.forEach(field => {
          const mappingEntry = Object.entries(fieldNameMappings).find(
            ([key]) => normalizeFieldName(key) === normalizeFieldName(field.name)
          );
          if (mappingEntry) {
            const [_, backendField] = mappingEntry;
            if (userData[backendField] !== undefined) {
              initialFormData[field.name] = userData[backendField];
            }
          } else if (userData[field.name] !== undefined) {
            initialFormData[field.name] = userData[field.name];
          }
        });
      });

      Object.keys(userData).forEach(key => {
        if (!initialFormData[key]) {
          initialFormData[key] = userData[key];
        }
      });

      setFormData(initialFormData);

      // Update photos
      if (userData.profilePhoto) {
        setPhotos(prevPhotos =>
          prevPhotos.map(photo =>
            photo.id === 1 ? { ...photo, url: userData.profilePhoto } : photo
          )
        );
      }

      // Set admin fill preference
      if (userData.profileSetup?.willAdminFill !== undefined) {
        setAdminWillFill(userData.profileSetup.willAdminFill);
        setDontAskAgain(userData.profileSetup.dontAskAgain || false);
        setShowFormFillChoice(!userData.profileSetup.willAdminFill && !userData.profileSetup.dontAskAgain);
      }

      // Set verification status
      if (userData.verificationStatus) {
        setVerificationStatus(userData.verificationStatus);
      }

      setIsLoading(false);
      setIsLoaded(true);
    } catch (error) {
      console.error("Error loading data:", error);
      setIsLoading(false);
      // Even if error, set loaded to true to stop refresh spinner
      setIsLoaded(true);
    }
  }, []); // Dependencies can be empty if setState functions are stable

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (Object.keys(formData).length > 0 && formSections.length > 0) {
      setProfileCompletion(calculateProfileCompletion());
    }
  }, [formData, formSections]);

  const calculateSectionCompletion = (section, formDataToCheck = formData) => {
    if (!section) return 0;

    // Special handling for Photos section
    if (section.label?.toLowerCase().includes('photo')) {
      const uploadedPhotos = photos.filter(p => p.url).length;
      return Math.round((uploadedPhotos / photos.length) * 100);
    }

    if (!section.fields || section.fields.length === 0) return 0;

    let filledCount = 0;
    section.fields.forEach(field => {
      const value = formDataToCheck[field.name];
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          if (value.length > 0 && value.some(item => typeof item === 'string' && item.trim() !== '')) {
            filledCount++;
          }
        } else if (typeof value === 'string' && value.trim() !== '') {
          filledCount++;
        } else if (typeof value === 'boolean' || typeof value === 'number') {
          filledCount++;
        }
      }
    });

    return Math.round((filledCount / section.fields.length) * 100);
  };

  const calculateProfileCompletion = (formDataToCheck = formData) => {
    if (!formSections.length) return 0;

    let totalFields = 0;
    let filledFields = 0;

    formSections.forEach(section => {
      if (section.label?.toLowerCase().includes('photo')) {
        totalFields += 1; // Count profile photo as one main field
        if (formDataToCheck.profilePhoto || (photos[0] && photos[0].url)) {
          filledFields++;
        }
      } else {
        section.fields.forEach(field => {
          totalFields++;
          const value = formDataToCheck[field.name];
          if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value)) {
              if (value.length > 0 && value.some(item => typeof item === 'string' && item.trim() !== '')) {
                filledFields++;
              }
            } else if (typeof value === 'string' && value.trim() !== '') {
              filledFields++;
            } else if (typeof value === 'boolean' || typeof value === 'number') {
              filledFields++;
            }
          }
        });
      }
    });

    return totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
  };

  const transformFormDataForBackend = (formData) => {
    const transformed = {};
    Object.keys(formData).forEach(formField => {
      if (formField === 'profileSetup' || formField === 'subscription') {
        return;
      }

      const mappingEntry = Object.entries(fieldNameMappings).find(
        ([key]) => normalizeFieldName(key) === normalizeFieldName(formField)
      );

      if (mappingEntry) {
        const [_, backendField] = mappingEntry;
        if (Array.isArray(formData[formField])) {
          transformed[backendField] = formData[formField].filter(item => item.trim() !== '');
        } else if (typeof formData[formField] === 'boolean') {
          transformed[backendField] = formData[formField];
        } else {
          transformed[backendField] = formData[formField] || null;
        }
      } else {
        transformed[formField] = formData[formField];
      }
    });

    if (formData.profilePhoto) {
      transformed.profilePhoto = formData.profilePhoto;
    }

    if (formData['Relative Surnames']) {
      if (Array.isArray(formData['Relative Surnames'])) {
        transformed.relativeSurname = formData['Relative Surnames'].filter(s => s.trim() !== '');
      } else if (typeof formData['Relative Surnames'] === 'string') {
        transformed.relativeSurname = formData['Relative Surnames'].split(',').map(s => s.trim()).filter(s => s !== '');
      }
    }

    return transformed;
  };

  const handleInputChange = (fieldName, value) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [fieldName]: value
      };
      setProfileCompletion(calculateProfileCompletion(newData));
      return newData;
    });
  };

  const handleProfileUpdate = async () => {
    // 1. Validation Logic
    const missingFields = [];

    // Check Form Sections
    formSections.forEach(section => {
      section.fields.forEach(field => {
        if (field.required) {
          const value = formData[field.name];
          const isMissing =
            value === undefined ||
            value === null ||
            (typeof value === 'string' && value.trim() === '') ||
            (Array.isArray(value) && value.length === 0);

          if (isMissing) {
            missingFields.push(field.label);
          }
        }
      });
    });

    // Check Profile Photo (if considered mandatory, usually is for dating apps)
    // We'll trust the config for text fields, but usually photo is special.
    // Let's rely on formSections 'photo' label if it exists, otherwise explicit check?
    // The previous code had a specific check for calculatesSectionCompletion('photo').
    // Let's stick to strict schema validation. If Admin says Photo is required, it should be in schema?
    // Actually, schema is for text fields. 'profilePhoto' is separate. 
    // Let's enforce it hardcoded for now as it's critical for visibility.
    if (!formData.profilePhoto && (!photos[0] || !photos[0].url)) {
      missingFields.push("Profile Photo");
    }

    if (missingFields.length > 0) {
      alert(`Please fill the following required details:\n\n${missingFields.join(', ')}`);
      return;
    }

    // 2. Proceed with Update
    const prevCompletion = profileCompletion;
    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const transformedData = transformFormDataForBackend(formData);
      const payload = {
        ...transformedData,
        userId: user?.user?.id || user?.id
      };

      const response = await fetch(`${Config.API_URL}/api/users/update`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const result = await response.json();
      const updatedCompletion = calculateProfileCompletion(formData);
      setProfileCompletion(updatedCompletion);

      if (updatedCompletion > prevCompletion) {
        setShowCompletionUpdate(true);
        setTimeout(() => setShowCompletionUpdate(false), 1000);
      }

      if (updatedCompletion === 100 && verificationStatus === 'Unverified') {
        await handleVerificationSubmit();
      }

      alert('Profile updated successfully!');
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleVerificationSubmit = async () => {
    try {
      const response = await fetch(`${Config.API_URL}/api/users/update`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.user?.id || user?.id,
          verificationStatus: 'Pending',
          verificationSubmittedAt: new Date(),
        }),
      });

      if (!response.ok) throw new Error('Failed to submit verification');

      const result = await response.json();
      setVerificationStatus('Pending');
      alert('Verification submitted successfully!');
    } catch (error) {
      console.error("Error submitting verification:", error);
      alert(`Error submitting verification: ${error.message}`);
    }
  };

  const pickImage = async (photoId) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 5],
      quality: 1,
    });

    if (!result.canceled) {
      handlePhotoUploadSuccess(result.assets[0].uri, photoId);
    }
  };

  const handlePhotoUploadSuccess = (url, photoId) => {
    setPhotos(prevPhotos =>
      prevPhotos.map(photo =>
        photo.id === photoId
          ? { ...photo, url }
          : photo
      )
    );

    if (photoId === 1) {
      handleInputChange('profilePhoto', url);
    }
  };

  const handleMakePrimary = (photoId) => {
    setPhotos(photos.map(photo => ({
      ...photo,
      isPrimary: photo.id === photoId
    })));
  };

  const handleAdminFillToggle = async (enabled) => {
    setAdminWillFill(enabled);

    try {
      const response = await fetch(`${Config.API_URL}/api/users/update`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.user?.id || user?.id,
          profileSetup: {
            willAdminFill: enabled,
            dontAskAgain: formData.profileSetup?.dontAskAgain || false
          }
        }),
      });

      if (!response.ok) throw new Error('Failed to update admin fill setting');

      const result = await response.json();
      setFormData(prev => ({
        ...prev,
        profileSetup: {
          ...prev.profileSetup,
          willAdminFill: enabled
        }
      }));
    } catch (error) {
      console.error("Error updating admin fill setting:", error);
      setAdminWillFill(!enabled);
    }
  };

  const formatDateToYYYYMMDD = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const renderFieldInput = (field) => {
    const value = formData[field.name] ?? '';

    switch (field.type.toLowerCase()) {
      case 'select':
      case 'checkbox':
        return (
          <FormInput
            label={field.label}
            value={field.type === 'checkbox' ? (value ? 'Yes' : 'No') : value}
            onChange={(val) => handleInputChange(field.name, field.type === 'checkbox' ? val === 'Yes' : val)}
            type={field.type.toLowerCase()}
            options={field.options}
            required={field.required}
          />
        );
      case 'date':
        return (
          <FormInput
            label={field.label}
            value={formatDateToYYYYMMDD(value)}
            onChange={(val) => handleInputChange(field.name, val)}
            placeholder={field.placeholder}
            type="date"
            required={field.required}
          />
        );
      case 'number':
        return (
          <FormInput
            label={field.label}
            value={value?.toString()}
            onChange={(val) => handleInputChange(field.name, val)}
            placeholder={field.placeholder}
            type="number"
            required={field.required}
          />
        );
      default:
        return (
          <FormInput
            label={field.label}
            value={value}
            onChange={(val) => handleInputChange(field.name, val)}
            placeholder={field.placeholder}
            type={field.type.toLowerCase()}
            required={field.required}
          />
        );
    }
  };

  const renderProfilePhotos = () => (
    <View style={{ padding: 16, alignItems: 'center' }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
        {photos.map((photo) => (
          <View key={photo.id} style={{ margin: 8 }}>
            <TouchableOpacity
              onPress={() => pickImage(photo.id)}
              style={{
                width: width / 3 - 24,
                height: (width / 3 - 24) * 1.25,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: Colors.borderLight,
                overflow: 'hidden'
              }}
            >
              {photo.url ? (
                <Image
                  source={{ uri: photo.url }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              ) : (
                <View style={{
                  flex: 1,
                  backgroundColor: Colors.backgroundTertiary,
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Camera size={24} color={Colors.textLight} />
                  <Text style={{ color: Colors.textLight, fontSize: 12, marginTop: 4, fontFamily: 'SpaceMono' }}>
                    Add Photo
                  </Text>
                </View>
              )}
              {photo.isPrimary && photo.url && (
                <View style={{
                  position: 'absolute',
                  top: 8,
                  left: 8,
                  backgroundColor: Colors.success,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 4
                }}>
                  <Text style={{ color: Colors.white, fontSize: 10, fontWeight: '500', fontFamily: 'SpaceMono' }}>Primary</Text>
                </View>
              )}
            </TouchableOpacity>
            <View style={{ marginTop: 8 }}>
              <TouchableOpacity
                onPress={() => pickImage(photo.id)}
                style={{
                  backgroundColor: Colors.secondaryLight,
                  padding: 8,
                  borderRadius: 8,
                  alignItems: 'center'
                }}
              >
                <Text style={{ color: Colors.primary, fontSize: 12, fontWeight: '500', fontFamily: 'SpaceMono' }}>
                  {photo.url ? 'Change' : 'Upload'}
                </Text>
              </TouchableOpacity>
              {photo.url && !photo.isPrimary && (
                <TouchableOpacity
                  onPress={() => handleMakePrimary(photo.id)}
                  style={{
                    backgroundColor: Colors.backgroundTertiary,
                    padding: 8,
                    borderRadius: 8,
                    alignItems: 'center',
                    marginTop: 4,
                    borderWidth: 1,
                    borderColor: Colors.borderLight
                  }}
                >
                  <Text style={{ color: Colors.textPrimary, fontSize: 12, fontWeight: '500', fontFamily: 'SpaceMono' }}>
                    Make Primary
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </View>
      <View style={{
        backgroundColor: Colors.lightWarning,
        borderWidth: 1,
        borderColor: Colors.warning,
        borderRadius: 12,
        padding: 16,
        marginTop: 16
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <AlertCircle size={20} color={Colors.warning} style={{ marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: Colors.warning, fontWeight: '600', fontSize: 14, fontFamily: 'SpaceMono' }}>
              Add more photos to increase profile visibility
            </Text>
            <Text style={{ color: Colors.textSecondary, fontSize: 12, marginTop: 4, fontFamily: 'SpaceMono' }}>
              Profiles with 3+ photos get 5x more interest!
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderSectionContent = (sectionId) => {
    const currentSection = formSections.find(s => s._id === sectionId);
    if (!currentSection) return null;

    if (currentSection.label.toLowerCase().includes('photo')) {
      return renderProfilePhotos();
    }

    return (
      <View style={{ padding: 16 }}>
        {currentSection.fields.map((field) => (
          <View key={field._id}>
            {field.name === 'Relative Surnames' ? (
              <View style={{ marginBottom: 20 }}>
                <Text style={{ color: Colors.textSecondary, marginBottom: 8, fontSize: 14, fontFamily: 'SpaceMono' }}>
                  {field.label}
                  {field.required && <Text style={{ color: Colors.danger }}>*</Text>}
                </Text>
                {(formData['Relative Surnames'] || []).map((surname, index) => (
                  <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <TextInput
                      value={surname}
                      onChangeText={(value) => {
                        const updatedSurnames = [...(formData['Relative Surnames'] || [])];
                        updatedSurnames[index] = value;
                        handleInputChange('Relative Surnames', updatedSurnames);
                      }}
                      placeholder="Enter surname"
                      placeholderTextColor={Colors.textLight}
                      style={{
                        flex: 1,
                        padding: 12,
                        borderWidth: 1,
                        borderColor: Colors.borderLight,
                        borderRadius: 12,
                        color: Colors.textPrimary,
                        backgroundColor: Colors.backgroundSecondary,
                        fontFamily: 'SpaceMono'
                      }}
                    />
                    <TouchableOpacity
                      onPress={() => {
                        const filteredSurnames = (formData['Relative Surnames'] || []).filter((_, i) => i !== index);
                        handleInputChange('Relative Surnames', filteredSurnames);
                      }}
                      style={{ marginLeft: 8, padding: 8 }}
                    >
                      <X size={20} color={Colors.danger} />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity
                  onPress={() => {
                    handleInputChange('Relative Surnames', [...(formData['Relative Surnames'] || []), '']);
                  }}
                  style={{
                    marginTop: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: Colors.primary,
                    padding: 12,
                    borderRadius: 12
                  }}
                >
                  <Plus size={16} color={Colors.white} style={{ marginRight: 4 }} />
                  <Text style={{ color: Colors.white, fontWeight: '500', fontFamily: 'SpaceMono' }}>Add Surname</Text>
                </TouchableOpacity>
              </View>
            ) : (
              renderFieldInput(field)
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderFormFillChoiceModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showFormFillChoice}
      onRequestClose={() => setShowFormFillChoice(false)}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
      }}>
        <Animated.View
          style={{
            width: '100%',
            backgroundColor: Colors.white,
            borderRadius: 20,
            padding: 24,
            transform: [{ translateY: slideUpAnim }],
            opacity: fadeAnim
          }}
        >
          <Text style={{
            color: Colors.textPrimary,
            fontSize: 20,
            fontWeight: '600',
            marginBottom: 16,
            textAlign: 'center',
            fontFamily: 'SpaceMono'
          }}>
            Complete Your Profile
          </Text>
          <Text style={{
            color: Colors.textSecondary,
            fontSize: 14,
            marginBottom: 24,
            lineHeight: 20,
            textAlign: 'center',
            fontFamily: 'SpaceMono'
          }}>
            Would you like to fill out your profile information now or have our team assist you later?
          </Text>
          <TouchableOpacity
            onPress={async () => {
              await handleAdminFillToggle(false);
              setShowFormFillChoice(false);
            }}
            style={{
              backgroundColor: Colors.primary,
              padding: 16,
              borderRadius: 12,
              alignItems: 'center',
              marginBottom: 12
            }}
          >
            <Text style={{ color: Colors.white, fontWeight: '600', fontFamily: 'SpaceMono' }}>I'll Fill It Myself</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async () => {
              await handleAdminFillToggle(true);
              setShowFormFillChoice(false);
            }}
            style={{
              backgroundColor: Colors.backgroundTertiary,
              padding: 16,
              borderRadius: 12,
              alignItems: 'center',
              marginBottom: 16,
              borderWidth: 1,
              borderColor: Colors.borderLight
            }}
          >
            <Text style={{ color: Colors.textPrimary, fontWeight: '600', fontFamily: 'SpaceMono' }}>Let Admin Fill It Later</Text>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Switch
              value={dontAskAgain}
              onValueChange={(value) => {
                setDontAskAgain(value);
                setFormData(prev => ({
                  ...prev,
                  profileSetup: {
                    ...prev.profileSetup,
                    dontAskAgain: value
                  }
                }));
              }}
              trackColor={{ false: Colors.borderLight, true: Colors.primaryLight }}
              thumbColor={Colors.primary}
            />
            <Text style={{ color: Colors.textSecondary, marginLeft: 8, fontSize: 13, fontFamily: 'SpaceMono' }}>
              Don't ask me again
            </Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );

  const renderCompletionUpdate = () => (
    <Animated.View
      style={{
        position: 'absolute',
        bottom: 40,
        left: 20,
        right: 20,
        backgroundColor: Colors.success,
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: showCompletionUpdate ? 1 : 0,
        transform: [
          {
            translateY: showCompletionUpdate ? 0 : 100
          }
        ]
      }}
    >
      <CheckCircle size={20} color={Colors.white} style={{ marginRight: 8 }} />
      <Text style={{ color: Colors.white, fontWeight: '600', fontFamily: 'SpaceMono' }}>
        Profile completion increased to {profileCompletion}%
      </Text>
    </Animated.View>
  );

  if (!isLoaded || isLoading) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ color: Colors.textPrimary, marginTop: 16, fontSize: 16, fontFamily: 'SpaceMono' }}>
          Loading your profile...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
      <View
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
          refreshControl={
            <RefreshControl
              refreshing={!isLoaded}
              onRefresh={() => {
                // Do not clear all state, just reload to keep UX smooth
                setIsLoaded(false);
                loadData();
              }}
              tintColor={Colors.primary}
            />
          }
        >
          <View style={{ padding: 20 }}>
            <View style={{
              backgroundColor: 'transparent',
              borderRadius: 16,
              padding: 20,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: Colors.borderLight,
              overflow: 'hidden'
            }}>
              <BlurView intensity={70} tint="light" style={StyleSheet.absoluteFill} />
              <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TouchableOpacity
                    onPress={() => pickImage(1)}
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 40,
                      borderWidth: 2,
                      borderColor: Colors.primaryLight,
                      overflow: 'hidden'
                    }}
                  >
                    {formData?.profilePhoto ? (
                      <Image
                        source={{ uri: formData.profilePhoto }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={{
                        flex: 1,
                        backgroundColor: Colors.secondaryLight,
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <User size={32} color={Colors.primary} />
                      </View>
                    )}
                    <View style={{
                      position: 'absolute',
                      bottom: -4,
                      right: -4,
                      backgroundColor: Colors.primary,
                      borderRadius: 12,
                      padding: 4
                    }}>
                      <Camera size={16} color={Colors.white} />
                    </View>
                  </TouchableOpacity>
                  <View style={{ marginLeft: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <Text style={{ color: Colors.textPrimary, fontSize: 20, fontWeight: '700', fontFamily: 'SpaceMono' }}>
                        {formData?.name || 'Your Name'}
                      </Text>
                      {verificationStatus === 'Verified' && (
                        <Award size={20} color={Colors.success} style={{ marginLeft: 8 }} />
                      )}
                    </View>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 }}>
                      {formData?.height && (
                        <Text style={{ color: Colors.textSecondary, fontSize: 14, marginRight: 12, fontFamily: 'SpaceMono' }}>
                          {formData.height}
                        </Text>
                      )}
                      {formData?.religion && (
                        <Text style={{ color: Colors.textSecondary, fontSize: 14, fontFamily: 'SpaceMono' }}>
                          {formData.religion}
                        </Text>
                      )}
                    </View>
                    {formData?.currentCity && (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MapPin size={16} color={Colors.textSecondary} style={{ marginRight: 4 }} />
                        <Text style={{ color: Colors.textSecondary, fontSize: 14, fontFamily: 'SpaceMono' }}>
                          {formData.currentCity}
                        </Text>
                      </View>
                    )}
                    <View style={{ marginTop: 8 }}>
                      <VerificationBadge status={verificationStatus} />
                    </View>
                  </View>
                </View>
                <View style={{
                  backgroundColor: Colors.secondaryLight,
                  borderRadius: 12,
                  padding: 16,
                  width: '100%'
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ color: Colors.textPrimary, fontSize: 14, fontWeight: '600', fontFamily: 'SpaceMono' }}>
                      Profile Completion
                    </Text>
                    <Text style={{ color: Colors.primary, fontSize: 14, fontWeight: '700', fontFamily: 'SpaceMono' }}>
                      {profileCompletion}%
                    </Text>
                  </View>
                  <View style={{
                    height: 6,
                    backgroundColor: Colors.backgroundTertiary,
                    borderRadius: 3,
                    overflow: 'hidden'
                  }}>
                    <LinearGradient
                      colors={[Colors.primary, Colors.primaryLight]}
                      style={{
                        height: '100%',
                        width: `${profileCompletion}%`,
                        borderRadius: 3
                      }}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    />
                  </View>
                  <TouchableOpacity
                    onPress={handleVerificationSubmit}
                    disabled={verificationStatus === 'Pending' || isSaving}
                    style={{
                      backgroundColor: Colors.primary,
                      padding: 12,
                      borderRadius: 8,
                      marginTop: 12,
                      alignItems: 'center'
                    }}
                  >
                    <Text style={{ color: Colors.white, fontWeight: '600', fontSize: 14, fontFamily: 'SpaceMono' }}>
                      {isSaving ? 'Saving...' : (
                        profileCompletion === 100 ?
                          (verificationStatus === 'Pending' ? 'Verification Pending' :
                            verificationStatus === 'Verified' ? 'Profile Verified' :
                              'Send for Verification') :
                          'Save Profile'
                      )}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={{
              backgroundColor: Colors.lightWarning,
              borderRadius: 12,
              padding: 16,
              marginBottom: 20,
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: Colors.warning
            }}>
              <Crown size={24} color={Colors.warning} style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: Colors.textPrimary, fontWeight: '600', fontSize: 16, fontFamily: 'SpaceMono' }}>
                  {formData.subscription?.plan || 'Free Plan'}
                </Text>
                <Text style={{ color: Colors.textSecondary, fontSize: 14, marginTop: 4, fontFamily: 'SpaceMono' }}>
                  Status: {formData.subscription?.isSubscribed ? 'Active' : 'Inactive'}
                </Text>
                <Text style={{ color: Colors.textSecondary, fontSize: 14, fontFamily: 'SpaceMono' }}>
                  Expires: {formData.subscription?.expiresAt ?
                    new Date(formData.subscription.expiresAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'Never'}
                </Text>
                <TouchableOpacity
                  onPress={() => router.push('/(dashboard)/(tabs)/settings')}
                  style={{
                    backgroundColor: Colors.backgroundTertiary,
                    padding: 12,
                    borderRadius: 8,
                    marginTop: 8,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: Colors.borderLight
                  }}
                >
                  <Text style={{ color: Colors.textPrimary, fontWeight: '600', fontSize: 14, fontFamily: 'SpaceMono' }}>
                    Manage Plan
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {formSections.map((section) => (
              <View key={section._id}>
                <ProfileSectionHeader
                  title={section.label}
                  completion={calculateSectionCompletion(section, formData)}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setExpandedSections(prev => ({
                      ...prev,
                      [section._id]: !prev[section._id]
                    }));
                  }}
                  isExpanded={expandedSections[section._id]}
                />
                {expandedSections[section._id] && (
                  <Animated.View
                    style={{
                      opacity: fadeAnim,
                      transform: [{ translateY: slideUpAnim }]
                    }}
                  >
                    {renderSectionContent(section._id)}
                  </Animated.View>
                )}
              </View>
            ))}

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
              <TouchableOpacity
                onPress={() => setExpandedSections(prev => ({
                  ...prev,
                  [formSections[0]?._id]: true
                }))}
                style={{
                  flex: 1,
                  backgroundColor: Colors.backgroundTertiary,
                  padding: 16,
                  borderRadius: 12,
                  alignItems: 'center',
                  marginRight: 8,
                  borderWidth: 1,
                  borderColor: Colors.borderLight
                }}
              >
                <Text style={{ color: Colors.textPrimary, fontWeight: '600', fontSize: 14, fontFamily: 'SpaceMono' }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleProfileUpdate}
                disabled={isSaving}
                style={{
                  flex: 1,
                  backgroundColor: Colors.primary,
                  padding: 16,
                  borderRadius: 12,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center'
                }}
              >
                {isSaving ? (
                  <ActivityIndicator color={Colors.white} style={{ marginRight: 8 }} />
                ) : (
                  <Upload size={20} color={Colors.white} style={{ marginRight: 8 }} />
                )}
                <Text style={{ color: Colors.white, fontWeight: '600', fontSize: 14, fontFamily: 'SpaceMono' }}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
        {/* {renderCompletionUpdate()} */}
        {/* {renderFormFillChoiceModal()} */}
      </View>
    </View>
  );
}

function getIconComponent(iconName) {
  const icons = {
    User, Heart, Eye, CheckCircle, Edit3, Crown, Camera, MapPin,
    Calendar, Award, Star, Gift, Sparkles, Settings, EyeOff,
    UserCheck, Upload, Briefcase, GraduationCap, Home, Users,
    Search, Clock, Bell, Shield, ChevronRight, Plus, X,
    AlertCircle, ToggleLeft, ToggleRight, XCircle, Phone
  };
  return icons[iconName] || User;
}
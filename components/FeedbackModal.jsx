import React, { useEffect, useRef } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    Pressable,
    Animated,
    Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { CheckCircle, XCircle, Info, X } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

const { width } = Dimensions.get('window');

const FeedbackModal = ({ visible, type = 'info', title, message, onClose, actions = [] }) => {
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 8,
                    tension: 40,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(scaleAnim, {
                    toValue: 0.8,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    if (!visible) return null;

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle size={48} color={Colors.success} fill={Colors.lightSuccess} />;
            case 'error':
                return <XCircle size={48} color={Colors.danger} fill={Colors.lightDanger} />;
            case 'info':
            default:
                return <Info size={48} color={Colors.info} fill={Colors.lightInfo} />;
        }
    };

    const getHeaderColor = () => {
        switch (type) {
            case 'success': return Colors.success;
            case 'error': return Colors.danger;
            case 'info': return Colors.info;
            default: return Colors.primary;
        }
    };

    return (
        <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="dark" />
                <Animated.View
                    style={[
                        styles.container,
                        {
                            opacity: opacityAnim,
                            transform: [{ scale: scaleAnim }],
                        },
                    ]}
                >
                    <View style={styles.content}>
                        <Pressable onPress={onClose} style={styles.closeButton}>
                            <X size={20} color={Colors.gray} />
                        </Pressable>

                        <View style={styles.iconContainer}>
                            {getIcon()}
                        </View>

                        <Text style={[styles.title, { color: getHeaderColor() }]}>{title}</Text>
                        <Text style={styles.message}>{message}</Text>

                        <View style={styles.actionsContainer}>
                            {actions.length > 0 ? (
                                actions.map((action, index) => (
                                    <Pressable
                                        key={index}
                                        onPress={action.onPress || onClose}
                                        style={[
                                            styles.button,
                                            action.style === 'cancel' ? styles.secondaryButton : styles.primaryButton,
                                            action.style !== 'cancel' && { backgroundColor: getHeaderColor() }
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.buttonText,
                                                action.style === 'cancel' ? styles.secondaryButtonText : styles.primaryButtonText
                                            ]}
                                        >
                                            {action.text}
                                        </Text>
                                    </Pressable>
                                ))
                            ) : (
                                <Pressable
                                    onPress={onClose}
                                    style={[styles.button, styles.primaryButton, { backgroundColor: getHeaderColor() }]}
                                >
                                    <Text style={styles.primaryButtonText}>Okay</Text>
                                </Pressable>
                            )}
                        </View>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    container: {
        width: width * 0.85,
        backgroundColor: Colors.white,
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10,
    },
    content: {
        padding: 24,
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        padding: 4,
        zIndex: 1,
    },
    iconContainer: {
        marginBottom: 16,
        padding: 16,
        borderRadius: 50,
        backgroundColor: Colors.backgroundSecondary,
    },
    title: {
        fontSize: 20,
        fontFamily: 'Outfit-Bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        fontSize: 15,
        fontFamily: 'Outfit-Regular',
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    actionsContainer: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
        justifyContent: 'center',
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        minWidth: 100,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    primaryButton: {
        // Background color set dynamically
    },
    secondaryButton: {
        backgroundColor: Colors.lightGray,
    },
    primaryButtonText: {
        color: Colors.white,
        fontFamily: 'Outfit-SemiBold',
        fontSize: 15,
    },
    secondaryButtonText: {
        color: Colors.textSecondary,
        fontFamily: 'Outfit-SemiBold',
        fontSize: 15,
    },
});

export default FeedbackModal;

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DraggableGridItem } from '../types';

interface GroupContainerProps {
    items: DraggableGridItem[];
    children: React.ReactNode;
    onUngroup?: () => void;
    isEditMode?: boolean;
}

export const GroupContainer: React.FC<GroupContainerProps> = ({
    items,
    children,
    onUngroup,
    isEditMode,
}) => {
    return (
        <View style={styles.container}>
            {/* Badge showing number of items */}
            <View style={styles.badge}>
                <Text style={styles.badgeText}>{items.length}</Text>
            </View>
            
            {/* Content */}
            <View style={styles.content}>
                {children}
            </View>
            
            {/* Ungroup button in edit mode */}
            {isEditMode && onUngroup && (
                <TouchableOpacity 
                    style={styles.ungroupButton}
                    onPress={onUngroup}
                    activeOpacity={0.7}
                >
                    <Text style={styles.ungroupText}>✕</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E0E7FF',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#818CF8',
        padding: 8,
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: '#6366F1',
        borderRadius: 12,
        minWidth: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
        zIndex: 10,
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
    },
    ungroupButton: {
        position: 'absolute',
        top: 4,
        left: 4,
        backgroundColor: '#EF4444',
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    ungroupText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
});

import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { DRAG_SCALE, GROUPING_SCALE, JIGGLE_ANGLE, JIGGLE_DURATION } from '../utils/constants';

interface GridItemProps {
    style?: StyleProp<ViewStyle>;
    dragStartAnimationStyle?: StyleProp<ViewStyle>;
    isEditMode: boolean;
    isActive: boolean;
    isGrouped: boolean;
    enableJiggle: boolean;
    showDeleteButton: boolean;
    delayLongPress: number;
    children: React.ReactNode;
    renderDeleteButton?: () => React.ReactElement;
    onPress: () => void;
    onLongPress: () => void;
}

export const GridItem: React.FC<GridItemProps> = ({
    style,
    dragStartAnimationStyle,
    isEditMode,
    isActive,
    isGrouped,
    enableJiggle,
    showDeleteButton,
    delayLongPress,
    children,
    renderDeleteButton,
    onPress,
    onLongPress,
}) => {
    const jiggleAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const animationRef = useRef<Animated.CompositeAnimation | null>(null);

    // Jiggle animation in edit mode
    useEffect(() => {
        if (isEditMode && enableJiggle && !isActive) {
            animationRef.current = Animated.loop(
                Animated.sequence([
                    Animated.timing(jiggleAnim, {
                        toValue: 1,
                        duration: JIGGLE_DURATION,
                        easing: Easing.linear,
                        useNativeDriver: false,
                    }),
                    Animated.timing(jiggleAnim, {
                        toValue: -1,
                        duration: JIGGLE_DURATION * 2,
                        easing: Easing.linear,
                        useNativeDriver: false,
                    }),
                    Animated.timing(jiggleAnim, {
                        toValue: 0,
                        duration: JIGGLE_DURATION,
                        easing: Easing.linear,
                        useNativeDriver: false,
                    }),
                ])
            );
            animationRef.current.start();
        } else {
            if (animationRef.current) {
                animationRef.current.stop();
                animationRef.current = null;
            }
            jiggleAnim.setValue(0);
        }

        return () => {
            if (animationRef.current) {
                animationRef.current.stop();
            }
        };
    }, [isEditMode, enableJiggle, isActive]);

    // Scale animation for active drag
    useEffect(() => {
        const targetScale = isActive ? DRAG_SCALE : (isGrouped ? GROUPING_SCALE : 1);
        Animated.spring(scaleAnim, {
            toValue: targetScale,
            friction: 4,
            tension: 40,
            useNativeDriver: false,
        }).start();
    }, [isActive, isGrouped]);

    const combinedTransform = [];
    if (isEditMode && enableJiggle && !isActive) {
        combinedTransform.push({
            rotate: jiggleAnim.interpolate({
                inputRange: [-1, 1],
                outputRange: [`-${JIGGLE_ANGLE}deg`, `${JIGGLE_ANGLE}deg`],
            }),
        });
    }
    combinedTransform.push({ scale: scaleAnim });

    return (
        <Animated.View style={[styles.container, style]}>
            <Animated.View style={[styles.wrapper, dragStartAnimationStyle]}>
                <Animated.View
                    style={[
                        styles.inner,
                        { transform: combinedTransform },
                    ]}
                >
                    <Pressable
                        onPress={onPress}
                        onLongPress={onLongPress}
                        delayLongPress={delayLongPress}
                        style={styles.pressable}
                    >
                        {children}
                    </Pressable>
                    {isEditMode && showDeleteButton && (
                        <View style={styles.deleteButton} pointerEvents="box-none">
                            {renderDeleteButton?.()}
                        </View>
                    )}
                </Animated.View>
            </Animated.View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    wrapper: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    inner: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    pressable: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    deleteButton: {
        position: 'absolute',
        top: 5,
        right: 5,
        zIndex: 10,
    },
});

// Block.tsx
import React, { memo } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import { useJiggleAnimation } from "../hooks/use-jiggle-animation";
import { useScaleAnimation } from "../hooks/use-scale-animation";
import type { BlockProps } from "../types";

export const Block = memo(function Block({
    style,
    dragStartAnimationStyle,
    onPress,
    onLongPress,
    delayLongPress = 200,
    children,
    isEditMode = false,
    enableJiggle = false,
    showDeleteButton = false,
    renderDeleteButton,
    isGrouped = false,
}: BlockProps) {
    const shouldJiggle = isEditMode && enableJiggle;

    const { interpolatedRotation } = useJiggleAnimation({
        isEnabled: shouldJiggle,
    });

    const { scaleValue } = useScaleAnimation({
        isScaled: isGrouped,
    });

    const transforms: Animated.WithAnimatedValue<any>[] = [];
    if (shouldJiggle) {
        transforms.push({ rotate: interpolatedRotation });
    }
    transforms.push({ scale: scaleValue });

    return (
        <Animated.View style={[styles.blockContainer, style]}>
            <Animated.View style={[styles.touchableWrapper, dragStartAnimationStyle]}>
                <Animated.View style={[styles.innerContainer, { transform: transforms }]}>
                    <Pressable
                        onPress={onPress}
                        onLongPress={onLongPress}
                        delayLongPress={delayLongPress}
                        style={styles.contentContainer}
                    >
                        {children}
                    </Pressable>
                    {isEditMode && showDeleteButton && renderDeleteButton && (
                        <View style={styles.deleteButtonContainer} pointerEvents="box-none">
                            {renderDeleteButton()}
                        </View>
                    )}
                </Animated.View>
            </Animated.View>
        </Animated.View>
    );
});

const styles = StyleSheet.create({
    blockContainer: {
        alignItems: "center",
        justifyContent: "center",
    },
    touchableWrapper: {
        flex: 1,
        width: "100%",
        height: "100%",
    },
    innerContainer: {
        flex: 1,
        width: "100%",
        height: "100%",
    },
    contentContainer: {
        flex: 1,
        width: "100%",
        height: "100%",
    },
    deleteButtonContainer: {
        position: "absolute",
        top: 5,
        right: 5,
        zIndex: 10,
    },
});

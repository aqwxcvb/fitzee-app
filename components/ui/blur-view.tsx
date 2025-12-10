import { BlurView, BlurViewProps } from "expo-blur";
import React from "react";
import { Animated, StyleSheet, useColorScheme, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

type SafeAreaEdge = "top" | "bottom" | "left" | "right";

interface BlurViewWrapperProps extends Omit<BlurViewProps, "tint" | "style"> {
    children: React.ReactNode;
    edges?: SafeAreaEdge[];
    intensity?: number;
    tint?: "light" | "dark" | "default";
    style?: ViewStyle | Animated.WithAnimatedValue<ViewStyle>;
    className?: string;
}

export const BlurViewWrapper: React.FC<BlurViewWrapperProps> = ({
    children,
    edges = [],
    intensity = 50,
    tint,
    style,
    className,
    ...props
}) => {
    const isDark = useColorScheme() === "dark";
    const insets = useSafeAreaInsets();

    const resolvedTint = tint ?? (isDark ? "dark" : "light");

    const safeAreaPadding: ViewStyle = {
        paddingTop: edges.includes("top") ? insets.top : 0,
        paddingBottom: edges.includes("bottom") ? insets.bottom : 0,
        paddingLeft: edges.includes("left") ? insets.left : 0,
        paddingRight: edges.includes("right") ? insets.right : 0,
    };

    return (
        <AnimatedBlurView
            intensity={intensity}
            tint={resolvedTint}
            style={[safeAreaPadding, style]}
            className={className}
            {...props}
        >
            {children}
        </AnimatedBlurView>
    );
};

interface AnimatedBlurHeaderProps extends Omit<BlurViewWrapperProps, "style"> {
    animatedHeight: Animated.AnimatedInterpolation<number>;
    includeTopSafeArea?: boolean;
    style?: ViewStyle | Animated.WithAnimatedValue<ViewStyle> | (ViewStyle | Animated.WithAnimatedValue<ViewStyle>)[]; 
}

export const AnimatedBlurHeader: React.FC<AnimatedBlurHeaderProps> = ({
    children,
    animatedHeight,
    includeTopSafeArea = true,
    intensity = 50,
    tint,
    style,
    className,
    ...props
}) => {
    const isDark = useColorScheme() === "dark";
    const insets = useSafeAreaInsets();

    const resolvedTint = tint ?? (isDark ? "dark" : "light");
    const topInset = includeTopSafeArea ? insets.top + 20 : 0;

    const totalHeight = Animated.add(animatedHeight, topInset);

    return (
        <AnimatedBlurView
            intensity={intensity}
            tint={resolvedTint}
            style={[
                styles.header,
                {
                    height: totalHeight,
                    paddingTop: topInset,
                },
                style,
            ]}
            className={className}
            {...props}
        >
            {children}
        </AnimatedBlurView>
    );
};

const styles = StyleSheet.create({
    header: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
});

export default BlurViewWrapper;

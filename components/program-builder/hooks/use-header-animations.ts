import { useMemo } from "react";
import { Animated } from "react-native";

export const HEADER_MAX_HEIGHT = 180;
export const HEADER_MIN_HEIGHT = 115;
export const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

export interface HeaderAnimatedValues {
    headerHeight: Animated.AnimatedInterpolation<number>;
    searchBarHeight: Animated.AnimatedInterpolation<number>;
    largeHeaderOpacity: Animated.AnimatedInterpolation<number>;
    smallHeaderOpacity: Animated.AnimatedInterpolation<number>;
    searchBarOpacity: Animated.AnimatedInterpolation<number>;
}

export interface HeaderConstants {
    HEADER_MAX_HEIGHT: number;
    HEADER_MIN_HEIGHT: number;
    HEADER_SCROLL_DISTANCE: number;
}

/**
 * Hook to calculate the animated values of the header based on scrollY.
 * Usable in the parent to access the values without ref.
 */
export function useHeaderAnimations(scrollY: Animated.Value): HeaderAnimatedValues {
    return useMemo(() => {
        const headerHeight = scrollY.interpolate({
            inputRange: [0, HEADER_SCROLL_DISTANCE],
            outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
            extrapolate: "clamp"
        });

        const searchBarHeight = scrollY.interpolate({
            inputRange: [0, HEADER_SCROLL_DISTANCE * 0.5, HEADER_SCROLL_DISTANCE],
            outputRange: [0, 0, 72],
            extrapolate: "clamp"
        });

        const largeHeaderOpacity = scrollY.interpolate({
            inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
            outputRange: [1, 0.3, 0],
            extrapolate: "clamp"
        });

        const smallHeaderOpacity = scrollY.interpolate({
            inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
            outputRange: [0, 0.3, 1],
            extrapolate: "clamp"
        });

        const searchBarOpacity = scrollY.interpolate({
            inputRange: [0, HEADER_SCROLL_DISTANCE * 0.5, HEADER_SCROLL_DISTANCE],
            outputRange: [0, 0, 1],
            extrapolate: "clamp"
        });

        return {
            headerHeight,
            searchBarHeight,
            largeHeaderOpacity,
            smallHeaderOpacity,
            searchBarOpacity
        };
    }, [scrollY]);
}

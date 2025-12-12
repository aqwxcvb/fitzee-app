import { useEffect, useRef } from "react";
import { Animated } from "react-native";

interface UseScaleAnimationOptions {
    isScaled: boolean;
    scaledValue?: number;
    normalValue?: number;
}

interface UseScaleAnimationReturn {
    scaleValue: Animated.Value;
}

export function useScaleAnimation({
    isScaled,
    scaledValue = 1.15,
    normalValue = 1,
}: UseScaleAnimationOptions): UseScaleAnimationReturn {
    const scaleValue = useRef(new Animated.Value(normalValue)).current;

    useEffect(() => {
        Animated.spring(scaleValue, {
            toValue: isScaled ? scaledValue : normalValue,
            friction: 4,
            tension: 40,
            useNativeDriver: false,
        }).start();
    }, [isScaled, scaleValue, scaledValue, normalValue]);

    return { scaleValue };
}

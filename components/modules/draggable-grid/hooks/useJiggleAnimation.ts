import { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";

const JIGGLE_DURATION = 100;
const JIGGLE_ANGLE = 1.5;

interface UseJiggleAnimationOptions {
    isEnabled: boolean;
}

interface UseJiggleAnimationReturn {
    animatedValue: Animated.Value;
    interpolatedRotation: Animated.AnimatedInterpolation<string>;
}

export function useJiggleAnimation({
    isEnabled,
}: UseJiggleAnimationOptions): UseJiggleAnimationReturn {
    const animatedValue = useRef(new Animated.Value(0)).current;
    const animationRef = useRef<Animated.CompositeAnimation | null>(null);

    useEffect(() => {
        if (isEnabled) {
            animationRef.current = Animated.loop(
                Animated.sequence([
                    Animated.timing(animatedValue, {
                        toValue: 1,
                        duration: JIGGLE_DURATION,
                        easing: Easing.linear,
                        useNativeDriver: false,
                    }),
                    Animated.timing(animatedValue, {
                        toValue: -1,
                        duration: JIGGLE_DURATION * 2,
                        easing: Easing.linear,
                        useNativeDriver: false,
                    }),
                    Animated.timing(animatedValue, {
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
            animatedValue.setValue(0);
        }

        return () => {
            if (animationRef.current) {
                animationRef.current.stop();
            }
        };
    }, [isEnabled, animatedValue]);

    const interpolatedRotation = animatedValue.interpolate({
        inputRange: [-1, 1],
        outputRange: [`-${JIGGLE_ANGLE}deg`, `${JIGGLE_ANGLE}deg`],
    });

    return {
        animatedValue,
        interpolatedRotation,
    };
}

import Monicon from "@monicon/native";
import { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";

const CHEVRON_COUNT = 5;
const CHEVRON_DELAY = 100;
const FADE_DURATION = 250;
const PAUSE_DURATION = 500;
const TOTAL_CYCLE = (CHEVRON_COUNT - 1) * CHEVRON_DELAY + FADE_DURATION * 2 + PAUSE_DURATION;

const ChevronAnimated: React.FC<{ index: number }> = ({ index }) => {
    const opacity = useRef(new Animated.Value(0.15)).current;
    const delay = index * CHEVRON_DELAY;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.delay(delay),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: FADE_DURATION,
                    easing: Easing.in(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.15,
                    duration: FADE_DURATION,
                    easing: Easing.in(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.delay(TOTAL_CYCLE - delay - FADE_DURATION * 2),
            ])
        );
        animation.start();
        return () => animation.stop();
    }, [opacity, delay]);

    return (
        <Animated.View style={{ opacity }}>
            <Monicon name="solar:alt-arrow-right-linear" size={28} color="#9CA3AF" />
        </Animated.View>
    );
};

export const SwipeIndicator: React.FC = () => {
    return (
        <View className="flex-row items-center">
            {[...Array(CHEVRON_COUNT)].map((_, i) => (
                <ChevronAnimated key={i} index={i} />
            ))}
        </View>
    );
};

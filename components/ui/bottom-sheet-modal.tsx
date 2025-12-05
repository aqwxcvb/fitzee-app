import { Children, cloneElement, isValidElement, useEffect } from "react";
import {
    Dimensions,
    Modal,
    Pressable,
    useColorScheme,
    View,
} from "react-native";
import {
    Gesture,
    GestureDetector,
    GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

interface BottomSheetModalProps {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    dismissThreshold?: number;
    enableDrag?: boolean;
}

const SCREEN_HEIGHT = Dimensions.get("window").height;
const DEFAULT_CLOSE_OFFSET = SCREEN_HEIGHT + 80;
const DEFAULT_DISMISS_THRESHOLD = 140;

const OPEN_CONFIG = {
    duration: 260,
    easing: Easing.out(Easing.cubic),
};

const CLOSE_CONFIG = {
    duration: 260,
    easing: Easing.in(Easing.cubic),
};

export function BottomSheetModal({
    visible,
    onClose,
    children,
    dismissThreshold = DEFAULT_DISMISS_THRESHOLD,
    enableDrag = true,
}: BottomSheetModalProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";

    const translateY = useSharedValue(DEFAULT_CLOSE_OFFSET);

    useEffect(() => {
        if (visible) {
            translateY.value = DEFAULT_CLOSE_OFFSET;
            translateY.value = withTiming(0, OPEN_CONFIG);
        }
    }, [visible, translateY]);

    const closeWithAnimation = () => {
        translateY.value = withTiming(DEFAULT_CLOSE_OFFSET, CLOSE_CONFIG, (finished) => {
            if (finished) {
                runOnJS(onClose)();
            }
        });
    };

    const panGesture = Gesture.Pan()
        .enabled(enableDrag)
        .onUpdate((event) => {
            if (event.translationY >= 0) {
                translateY.value = event.translationY;
            }
        })
        .onEnd((event) => {
            if (translateY.value > dismissThreshold || event.velocityY > 800) {
                translateY.value = withTiming(
                    DEFAULT_CLOSE_OFFSET,
                    CLOSE_CONFIG,
                    (finished) => {
                        if (finished) {
                            runOnJS(onClose)();
                        }
                    },
                );
            } else {
                translateY.value = withTiming(0, OPEN_CONFIG);
            }
        });

    const sheetStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    const overlayStyle = useAnimatedStyle(() => {
        const progress = translateY.value / DEFAULT_CLOSE_OFFSET;
        const eased = Math.pow(progress, 1);
        return {
            opacity: 1 - eased,
        };
    });

    const lightSheetShadow = {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 12,
    };

    const darkSheetShadow = {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.5,
        shadowRadius: 18,
        elevation: 10,
    };

    const sheetShadow = isDark ? darkSheetShadow : lightSheetShadow;

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={closeWithAnimation}
            statusBarTranslucent
        >
            <GestureHandlerRootView style={{ flex: 1 }}>
                <View className="flex-1 justify-end">
                    {/* Overlay */}
                    <Animated.View
                        className="absolute inset-0 bg-black/60"
                        style={overlayStyle}
                    >
                        <Pressable className="flex-1" onPress={closeWithAnimation} />
                    </Animated.View>

                    {/* Bottom sheet */}
                    <Animated.View
                        style={[sheetStyle, sheetShadow, { borderTopLeftRadius: 32, borderTopRightRadius: 32, borderTopWidth: 0.5, borderTopColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }]}
                        className="bg-foreground-light dark:bg-foreground-dark pb-8 pt-3"
                    >
                        {enableDrag && (
                            <GestureDetector gesture={panGesture}>
                                <Animated.View className="pb-4 items-center">
                                    <View className="w-9 h-1.5 rounded-full bg-accent-light dark:bg-accent-dark" />
                                </Animated.View>
                            </GestureDetector>
                        )}

                        {Children.map(children, (child) =>
                            isValidElement(child)
                                ? cloneElement(child, { closeWithAnimation } as any)
                                : child,
                        )}
                    </Animated.View>
                </View>
            </GestureHandlerRootView>
        </Modal>
    );
}

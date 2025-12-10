import { Body } from "@/components/ui/typography";
import Monicon from "@monicon/native";
import { Fragment, useEffect, useRef, useState } from "react";
import { Animated, Pressable, TouchableOpacity, useColorScheme, View } from "react-native";

interface PopupOption {
    label: string;
    icon: string;
    onPress: () => void;
}

interface PillButtonProps {
    onScrollToTop: () => void;
    options: PopupOption[];
}

export function PillButton({ onScrollToTop, options }: PillButtonProps) {
    const colorScheme = useColorScheme();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    
    const accentColor = colorScheme === "dark" ? "#0A84FF" : "#007AFF";

    useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: isMenuOpen ? 1 : 0,
                useNativeDriver: true,
                tension: 100,
                friction: 8,
            }),
            Animated.timing(opacityAnim, {
                toValue: isMenuOpen ? 1 : 0,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start();
    }, [isMenuOpen]);

    const handleOptionPress = (option: PopupOption) => {
        setIsMenuOpen(false);
        option.onPress();
    };

    return (
        <>
            <Animated.View 
                className="absolute inset-0 bg-black/40"
                style={{ opacity: opacityAnim, zIndex: 100 }}
                pointerEvents={isMenuOpen ? "auto" : "none"}
            >
                <Pressable 
                    className="flex-1" 
                    onPress={() => setIsMenuOpen(false)} 
                />
            </Animated.View>

            <View className="absolute bottom-8 right-6" style={{ zIndex: 101 }}>
                <Animated.View
                    className="absolute bottom-20 right-0 bg-base-secondary-light dark:bg-base-secondary-dark rounded-xl overflow-hidden px-0 py-0"
                    style={{
                        opacity: opacityAnim,
                        transform: [
                            { scale: scaleAnim },
                            {
                                translateY: scaleAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [20, 0],
                                }),
                            },
                        ],
                        borderWidth: 1,
                        borderColor: "transparent",
                    }}
                    pointerEvents={isMenuOpen ? "auto" : "none"}
                >
                    <View className="flex-col w-[240px] p-4 gap-6">
                        {options.map((option, index) => (
                            <Fragment key={index}>
                                <TouchableOpacity
                                    onPress={() => handleOptionPress(option)}
                                    className="flex-1 flex-row items-center gap-4"
                                >
                                    <Monicon name={option.icon} size={24} color={accentColor} />
                                    <Body className="shrink text-content-primary-light dark:text-content-primary-dark">
                                        {option.label}
                                    </Body>
                                </TouchableOpacity>
                            </Fragment>
                        ))}
                    </View>
                </Animated.View>

                <View className="flex-row rounded-full bg-accent-primary-light dark:bg-accent-primary-dark shadow-lg overflow-hidden">
                    <TouchableOpacity
                        onPress={onScrollToTop}
                        className="w-16 h-16 items-center justify-center"
                    >
                        <Monicon name="solar:alt-arrow-up-linear" size={22} color="#ffffff" />
                    </TouchableOpacity>

                    <View className="w-[1px] h-1/2 self-center bg-accent-primary-stroke-muted-light dark:bg-accent-primary-stroke-muted-dark" />

                    <TouchableOpacity
                        onPress={() => setIsMenuOpen(!isMenuOpen)}
                        className="w-16 h-16 items-center justify-center"
                    >
                        <Animated.View
                            style={{
                                transform: [
                                    {
                                        rotate: scaleAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: ["0deg", "45deg"],
                                        }),
                                    },
                                ],
                            }}
                        >
                            <Monicon name="ic:twotone-plus" size={22} color="#ffffff" />
                        </Animated.View>
                    </TouchableOpacity>
                </View>
            </View>
        </>
    );
}

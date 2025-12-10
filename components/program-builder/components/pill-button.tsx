import { PopupWrapper } from "@/components/ui/popup/popup-wrapper";
import { PopupOption } from "@/components/ui/popup/types";
import Monicon from "@monicon/native";
import { useEffect, useRef, useState } from "react";
import { Animated, TouchableOpacity, View } from "react-native";

interface PillButtonProps {
    onScrollToTop: () => void;
    options: PopupOption[];
}

export function PillButton({ onScrollToTop, options }: PillButtonProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const scaleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: isMenuOpen ? 1 : 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
        }).start();
    }, [isMenuOpen]);

    return (
        <PopupWrapper 
            isOpen={isMenuOpen} 
            onClose={() => setIsMenuOpen(false)} 
            options={options}
        >
            <View className="absolute bottom-8 right-6">
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
        </PopupWrapper>
    );
}

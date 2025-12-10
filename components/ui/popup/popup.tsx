import { Body } from "@/components/ui/typography";
import Monicon from "@monicon/native";
import React, { Fragment, useEffect, useRef, useState } from "react";
import {
    Animated,
    LayoutChangeEvent,
    Platform,
    Pressable,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";
import { PopupOption, PopupProps } from "./types";

export function Popup({
    isOpen,
    onClose,
    options,
    triggerPosition,
    offset = 8,
    width = 240,
    showOverlay = true,
}: PopupProps) {
    const colorScheme = useColorScheme();
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const [popupHeight, setPopupHeight] = useState(0);

    const accentColor = colorScheme === "dark" ? "#0A84FF" : "#007AFF";

    useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: isOpen ? 1 : 0,
                useNativeDriver: true,
                tension: 100,
                friction: 8,
            }),
            Animated.timing(opacityAnim, {
                toValue: isOpen ? 1 : 0,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start();
    }, [isOpen]);

    const handleOptionPress = (option: PopupOption) => {
        onClose();
        option.onPress();
    };

    const getPopupPositionStyle = () => {
        if (!triggerPosition) {
            return { top: -9999, left: -9999 };
        }
    
        const { x, y, width: triggerWidth, height: triggerHeight } = triggerPosition;
        
        let top: number;
        if (popupHeight + offset <= y) {
            top = y - popupHeight - offset;
        } else {
            top = y + triggerHeight + offset;
        }
    
        let left = x + triggerWidth - width;
        if (left < 0) {
            left = x;
        }
    
        return { top, left };
    };
    

    const handleLayout = (event: LayoutChangeEvent) => {
        const { height } = event.nativeEvent.layout;

        if(height !== popupHeight) {
            setPopupHeight(height);
        }
    };

    const actionSheetShadow = Platform.select({
        ios: colorScheme === "dark"
            ? {
                shadowColor: "#000",
                shadowOpacity: 0.8,
                shadowRadius: 28,
                shadowOffset: { width: -12, height: -12 },
            }
            : {
                shadowColor: "#000",
                shadowOpacity: 0.15,
                shadowRadius: 20,
                shadowOffset: { width: 0, height: 0 },
            },
        android: {
            elevation: 3,
            shadowColor: "#000",
        },
    });

    return (
        <>
            {showOverlay && (
                <Animated.View
                    className="absolute inset-0"
                    style={{ opacity: opacityAnim, zIndex: 10 }}
                    pointerEvents={isOpen ? "auto" : "none"}
                >
                    <Pressable className="flex-1" onPress={onClose} />
                </Animated.View>
            )}

            <Animated.View
                className="absolute bg-surface-primary-light dark:bg-surface-primary-dark rounded-xl"
                onLayout={handleLayout}
                style={[
                    getPopupPositionStyle(),
                    actionSheetShadow,
                    {
                        width,
                        opacity: opacityAnim,
                        transform: [{ scale: scaleAnim }],
                        zIndex: 10,
                    },
                ]}
                pointerEvents={isOpen ? "auto" : "none"}
            >
                <View className="flex-col p-4 gap-6">
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
        </>
    );
}

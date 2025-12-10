import { AnimatedBlurHeader } from "@/components/ui/blur-view";
import { Headline } from "@/components/ui/typography";
import { useTranslation } from "@/i18n";
import Monicon from "@monicon/native";
import { useRouter } from "expo-router";
import React from "react";
import {
    Animated,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View
} from "react-native";
import { useHeaderAnimations } from "../../hooks/use-header-animations";
import ExerciseSearchBar from "../exercise-search-bar";

interface HeaderProps {
    scrollY: Animated.Value;
    sessionName: string;
    onSessionNameChange: (name: string) => void;
}

export function Header({ scrollY, sessionName, onSessionNameChange }: HeaderProps) {
    const { __ } = useTranslation();
    const router = useRouter();
    const isDark = useColorScheme() === "dark";
    const iconColor = isDark ? "#8e8e93" : "#636366";

    const animatedValues = useHeaderAnimations(scrollY);

    return (
        <AnimatedBlurHeader
            animatedHeight={animatedValues.headerHeight}
            className="px-4 overflow-hidden"
        >
            <View>
                <View className="flex flex-row items-center">
                    <TouchableOpacity
                        className="self-start flex items-center px-4 py-2 rounded-lg bg-surface-primary-light dark:bg-surface-primary-dark overflow-hidden"
                        onPress={() => router.back()}
                    >
                        <Monicon
                            name="solar:alt-arrow-left-linear"
                            size={18}
                            color={isDark ? "#ffffff" : "#000000"}
                        />
                    </TouchableOpacity>

                    <Animated.View
                        style={{ opacity: animatedValues.smallHeaderOpacity }}
                        className="flex-1 ml-3"
                    >
                        <View className="flex-row items-center">
                            <Text className="max-w-[33%] text-[17px] font-sfpro-medium tracking-tight text-content-secondary-light dark:text-content-secondary-dark" numberOfLines={1}>
                                Full Body
                            </Text>
                            <Text className="mx-2 text-[17px] font-sfpro-medium tracking-tight text-content-secondary-light dark:text-content-secondary-dark">
                                /
                            </Text>
                            <Text className="flex-1 text-[17px] font-sfpro-bold tracking-tight text-content-primary-light dark:text-content-primary-dark" numberOfLines={1}>
                                {sessionName.trim().length > 0 ? sessionName : "Ma séance..."}
                            </Text>
                        </View>
                    </Animated.View>
                </View>

                <Animated.View style={{ height: animatedValues.searchBarHeight, opacity: animatedValues.searchBarOpacity, overflow: "hidden" }}>
                    <ExerciseSearchBar value="" onChangeText={() => {}} onFilterPress={() => {}} className="mt-4" />
                </Animated.View>
            </View>

            <Animated.View
                style={{ opacity: animatedValues.largeHeaderOpacity }}
                className="my-4 flex-1"
            >
                <View className="flex-row items-center gap-4 h-14">
                    <View className="max-w-[50%]">
                        <TouchableOpacity 
                            className="flex-1 flex-row items-center gap-2 px-4 rounded-xl bg-surface-primary-light dark:bg-surface-primary-dark"
                            onPress={() => router.push("/(modals)/choose-program")}
                        >
                            <Monicon name="solar:folder-with-files-linear" size={18} color={iconColor} />
                            <Headline className="shrink text-content-primary-light dark:text-content-primary-dark" numberOfLines={1}>
                                Full Body
                            </Headline>
                            <Monicon name="solar:alt-arrow-down-linear" size={18} color={iconColor} />
                        </TouchableOpacity>
                    </View>
                    <View className="flex-1">
                        <TextInput
                            className="flex-1 px-4 text-[15px] font-sfpro-semibold tracking-tight text-content-primary-light dark:text-content-primary-dark bg-surface-primary-light dark:bg-surface-primary-dark rounded-xl"
                            placeholder={__("Ma séance...")}
                            value={sessionName}
                            onChangeText={onSessionNameChange}
                        />
                    </View>
                </View>

                <ExerciseSearchBar value="" onChangeText={() => {}} onFilterPress={() => {}} className="my-4" />
            </Animated.View>
        </AnimatedBlurHeader>
    );
}

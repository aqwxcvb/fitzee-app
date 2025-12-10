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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderAnimations } from "../../hooks/use-header-animations";
import ExerciseSearchBar from "../exercise-search-bar";

interface HeaderProps {
    scrollY: Animated.Value;
    sessionName: string;
    onSessionNameChange: (name: string) => void;
    searchValue: string;
    onSearchValueChange: (value: string) => void;
}

export function Header({ scrollY, sessionName, onSessionNameChange, searchValue, onSearchValueChange }: HeaderProps) {
    const { __ } = useTranslation();
    const router = useRouter();
    
    const isDark = useColorScheme() === "dark";
    const iconColor = isDark ? "#8e8e93" : "#636366";
    const insets = useSafeAreaInsets();
    const animatedValues = useHeaderAnimations(scrollY);
    

    const topInset = insets.top + 20;
    const totalHeight = Animated.add(animatedValues.headerHeight, topInset);

    return (
        <Animated.View
            style={{ height: totalHeight, paddingTop: topInset }}
            className="px-4 overflow-hidden absolute inset-0 bg-surface-primary-light dark:bg-surface-primary-dark z-10"
        >
            <View>
                <View className="flex flex-row items-center">
                    <TouchableOpacity
                        className="self-start flex items-center px-4 py-3 rounded-xl bg-surface-primary-muted-light dark:bg-surface-primary-muted-dark overflow-hidden"
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
                    <ExerciseSearchBar value={searchValue} onChangeText={onSearchValueChange} onFilterPress={() => {}} className="mt-4" />
                </Animated.View>
            </View>

            <Animated.View
                style={{ opacity: animatedValues.largeHeaderOpacity }}
                className="my-4 flex-1"
            >
                <View className="flex-row items-center gap-4 h-[52px]">
                    <View className="max-w-[50%]">
                        <TouchableOpacity 
                            className="flex-1 flex-row items-center gap-2 px-4 rounded-xl bg-surface-primary-muted-light dark:bg-surface-primary-muted-dark"
                            onPress={() => router.push("/(modals)/choose-program")}
                        >
                            <Monicon name="solar:folder-with-files-linear" size={18} color={iconColor} />
                            <Headline className="shrink text-content-primary-light dark:text-content-primary-dark" numberOfLines={1}>
                                Full Body
                            </Headline>
                            <Monicon name="solar:alt-arrow-down-linear" size={18} color={iconColor} />
                        </TouchableOpacity>
                    </View>
                    <View className="flex-1 justify-center">
                        <TextInput
                            className="flex-1 px-4 text-[17px] font-sfpro-semibold tracking-tight text-content-primary-light dark:text-content-primary-dark bg-surface-primary-muted-light dark:bg-surface-primary-muted-dark rounded-xl"
                            placeholder={__("Ma séance...")}
                            value={sessionName}
                            onChangeText={onSessionNameChange}
                        />
                    </View>
                </View>

                <ExerciseSearchBar value={searchValue} onChangeText={onSearchValueChange} onFilterPress={() => {}} className="my-4" />
            </Animated.View>
        </Animated.View>
    );
}

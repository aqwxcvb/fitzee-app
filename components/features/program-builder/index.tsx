import { AnimatedBlurHeader } from "@/components/ui/blur-view";
import { Headline } from "@/components/ui/typography";
import { useTranslation } from "@/i18n";
import Monicon from "@monicon/native";
import React, { useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ExerciseSearchBar from "./components/exercise-search-bar";
import ExerciseLibraryPanel from "./exercise-library-panel";
import WorkoutBuilderPanel from "./workout-builder-panel";

const SCREEN_WIDTH = Dimensions.get("window").width * 0.9;
const HEADER_MAX_HEIGHT = 180;
const HEADER_MIN_HEIGHT = 110;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

const ProgramBuilder = () => {
    const { __ } = useTranslation();
    const isDark = useColorScheme() === "dark";
    const iconColor = isDark ? "#8e8e93" : "#636366";
    const insets = useSafeAreaInsets();

    const [sessionName, setSessionName] = useState("");

    const scrollY = useRef(new Animated.Value(0)).current;
    const exerciseListRef = useRef<ScrollView>(null);

    const headerHeight = scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE],
        outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
        extrapolate: "clamp"
    });

    const searchBarHeight = scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE * 0.5, HEADER_SCROLL_DISTANCE],
        outputRange: [0, 0, 56],
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

    const handleScrollToTop = () => exerciseListRef.current?.scrollTo({ y: 0, animated: true });

    const handleAddAction = () => {
        // TODO: Implémenter les actions du bouton +
    };

    return (
        <View className="flex-1 bg-base-primary-light dark:bg-base-primary-dark">
            <AnimatedBlurHeader
                animatedHeight={headerHeight}
                className="px-4"
            >
                <View>
                    <View className="flex flex-row items-center">
                        <TouchableOpacity
                            className="self-start flex items-center px-4 py-2 rounded-lg bg-surface-primary-light dark:bg-surface-primary-dark overflow-hidden"
                            onPress={() => {}}
                        >
                            <Monicon
                                name="solar:alt-arrow-left-linear"
                                size={18}
                                color={iconColor}
                            />
                        </TouchableOpacity>

                        <Animated.View
                            style={{ opacity: smallHeaderOpacity }}
                            className="flex-1 ml-3"
                        >
                            <View className="flex-row items-center">
                                <Text className="text-[17px] font-sfpro-medium tracking-tight text-content-secondary-light dark:text-content-secondary-dark" numberOfLines={1}>
                                    Full Body
                                </Text>
                                <Text className="mx-2 text-[17px] font-sfpro-medium tracking-tight text-content-secondary-light dark:text-content-secondary-dark">
                                    /
                                </Text>
                                <Text className="text-[17px] font-sfpro-bold tracking-tight text-content-primary-light dark:text-content-primary-dark" numberOfLines={1}>
                                    {sessionName.trim().length > 0 ? sessionName : "Ma séance..."}
                                </Text>
                            </View>
                        </Animated.View>
                    </View>

                    <Animated.View style={{ height: searchBarHeight, opacity: searchBarOpacity, overflow: "hidden" }}>
                        <ExerciseSearchBar value="" onChangeText={() => {}} onFilterPress={() => {}} className="mt-3" />
                    </Animated.View>
                </View>

                <Animated.View
                    style={{ opacity: largeHeaderOpacity }}
                    className="my-4"
                >
                    <View className="flex-row items-center gap-4">
                        <View className="max-w-[50%]">
                            <TouchableOpacity
                                className="flex-row gap-2 p-4 rounded-xl bg-surface-primary-light dark:bg-surface-primary-dark overflow-hidden"
                                onPress={() => {}}
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
                                className="flex-1 p-4 text-[17px] font-sfpro-semibold tracking-tight text-content-primary-light dark:text-content-primary-dark rounded-xl bg-surface-primary-light dark:bg-surface-primary-dark"
                                placeholder={__("Ma séance...")}
                                autoCorrect={false}
                                value={sessionName}
                                onChangeText={setSessionName}
                            />
                        </View>
                    </View>

                    <ExerciseSearchBar value="" onChangeText={() => {}} onFilterPress={() => {}} className="my-4" />
                </Animated.View>
            </AnimatedBlurHeader>

            <View className="flex-1">
                <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    decelerationRate="fast"
                    bounces={false}
                    overScrollMode="never"
                >
                    <View style={{ width: SCREEN_WIDTH }} className="flex-1">
                        <ExerciseLibraryPanel currentHeaderHeight={Animated.add(headerHeight, insets.top)} headerScrollDistance={HEADER_SCROLL_DISTANCE} scrollY={scrollY} scrollViewRef={exerciseListRef} />
                    </View>

                    <View style={{ width: SCREEN_WIDTH }} className="flex-1">
                        <WorkoutBuilderPanel currentHeaderHeight={Animated.add(headerHeight, insets.top)} headerScrollDistance={HEADER_SCROLL_DISTANCE} />
                    </View>
                </ScrollView>
            </View>

            <View className="absolute bottom-8 right-6 flex-row rounded-full bg-accent-primary-light dark:bg-accent-primary-dark shadow-lg overflow-hidden">
                <TouchableOpacity
                    onPress={handleScrollToTop}
                    className="w-16 h-16 items-center justify-center"
                >
                    <Monicon name="solar:alt-arrow-up-linear" size={22} color="#ffffff" />
                </TouchableOpacity>

                <View className="w-[1px] h-1/2 self-center bg-accent-primary-stroke-muted-light dark:bg-accent-primary-stroke-muted-dark" />

                <TouchableOpacity
                    onPress={handleAddAction}
                    className="w-16 h-16 items-center justify-center"
                >
                    <Monicon name="ic:twotone-plus" size={22} color="#ffffff" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default ProgramBuilder;

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
import ExerciseSearchBar from "./components/exercise-search-bar";
import ExerciseLibraryPanel from "./exercise-library-panel";
import WorkoutBuilderPanel from "./workout-builder-panel";

const SCREEN_WIDTH = Dimensions.get("window").width * 0.9;
const HEADER_MAX_HEIGHT = 190;
const HEADER_MIN_HEIGHT = 120;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

const ProgramBuilder = () => {
    const { __ } = useTranslation();
    const isDark = useColorScheme() === "dark";
    const iconColor = isDark ? "#8e8e93" : "#636366";

    const [sessionName, setSessionName] = useState("");

    const scrollY = useRef(new Animated.Value(0)).current;

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

    return (
        <View className="flex-1 bg-background">
            <Animated.View
                style={{ height: headerHeight }}
                className="px-4 pt-4 pb-2"
            >
                <View>
                    <View className="flex flex-row items-center">
                        <TouchableOpacity
                            className="self-start flex items-center px-4 py-2 rounded-lg bg-surface-light dark:bg-surface-dark overflow-hidden"
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
                                <Text className="text-[17px] font-sfpro-medium tracking-tight text-content-light dark:text-content-dark" numberOfLines={1}>
                                    Full Body
                                </Text>
                                <Text className="mx-2 text-[17px] font-sfpro-medium tracking-tight text-content-light dark:text-content-dark">
                                    /
                                </Text>
                                <Text className="text-[17px] font-sfpro-bold tracking-tight text-content-strong dark:text-content-inverse" numberOfLines={1}>
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
                                className="flex-row gap-2 p-4 rounded-lg bg-surface-light dark:bg-surface-dark overflow-hidden"
                                onPress={() => {}}
                            >
                                <Monicon name="solar:folder-with-files-linear" size={18} color={iconColor} />
                                <Headline className="shrink" numberOfLines={1}>
                                    Full Body
                                </Headline>
                                <Monicon name="solar:alt-arrow-down-linear" size={18} color={iconColor} />
                            </TouchableOpacity>
                        </View>

                        <View className="flex-1">
                            <TextInput
                                className="flex-1 p-4 text-[17px] font-sfpro-semibold tracking-tight text-content-strong dark:text-content-inverse rounded-lg bg-surface-light dark:bg-surface-dark"
                                placeholder={__("Ma séance...")}
                                autoCorrect={false}
                                value={sessionName}
                                onChangeText={setSessionName}
                            />
                        </View>
                    </View>

                    <ExerciseSearchBar value="" onChangeText={() => {}} onFilterPress={() => {}} className="my-4" />
                </Animated.View>
            </Animated.View>

            <View className="flex-1">
                <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    decelerationRate="fast"
                >
                    <View style={{ width: SCREEN_WIDTH }} className="flex-1">
                        <ExerciseLibraryPanel headerScrollDistance={HEADER_SCROLL_DISTANCE} scrollY={scrollY} />
                    </View>

                    <View style={{ width: SCREEN_WIDTH }} className="flex-1">
                        <WorkoutBuilderPanel headerScrollDistance={HEADER_SCROLL_DISTANCE} />
                    </View>
                </ScrollView>
            </View>
        </View>
    );
};

export default ProgramBuilder;

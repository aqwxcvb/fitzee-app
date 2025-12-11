import { useTranslation } from "@/i18n";
import { FlashListRef } from "@shopify/flash-list";
import { useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    ScrollView,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "./components/layout/header";
import { PillButton } from "./components/pill-button";
import ExerciseLibraryPanel from "./exercise-library-panel";
import { HEADER_SCROLL_DISTANCE, useHeaderAnimations } from "./hooks/use-header-animations";
import { Exercise } from "./types/exercise";
import WorkoutBuilderPanel from "./workout-builder-panel";

const SCREEN_WIDTH = Dimensions.get("window").width;

export function ProgramBuilder() {
    const { __ } = useTranslation();
    const insets = useSafeAreaInsets();

    const [sessionName, setSessionName] = useState("");
    const [searchValue, setSearchValue] = useState("");

    const scrollY = useRef(new Animated.Value(0)).current;
    const { headerHeight } = useHeaderAnimations(scrollY);

    const exerciseListRef = useRef<FlashListRef<Exercise> | null>(null);
    const handleScrollToTop = () => exerciseListRef.current?.scrollToOffset({ offset: 0, animated: true });

    return (
        <View className="flex-1 bg-base-primary-light dark:bg-base-primary-dark">
            <Header
                scrollY={scrollY}
                sessionName={sessionName}
                onSessionNameChange={setSessionName}
                searchValue={searchValue}
                onSearchValueChange={setSearchValue}
            />

            <View className="flex-1">
                <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    decelerationRate="fast"
                    contentOffset={{ x: SCREEN_WIDTH, y: 0 }}
                >
                    <View style={{ width: SCREEN_WIDTH }} className="flex-1">
                        <ExerciseLibraryPanel 
                            currentHeaderHeight={Animated.add(headerHeight, insets.top + 20)} 
                            headerScrollDistance={HEADER_SCROLL_DISTANCE} 
                            scrollY={scrollY} 
                            flashListRef={exerciseListRef} 
                        />
                    </View>

                    <View style={{ width: SCREEN_WIDTH }} className="flex-1">
                        <WorkoutBuilderPanel 
                            currentHeaderHeight={Animated.add(headerHeight, insets.top + 20)} 
                            headerScrollDistance={HEADER_SCROLL_DISTANCE} 
                        />
                    </View>
                </ScrollView>
            </View>

            <PillButton 
                onScrollToTop={handleScrollToTop} 
            />
        </View>
    );
};

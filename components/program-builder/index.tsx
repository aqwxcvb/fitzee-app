import Monicon from "@monicon/native";
import { useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    ScrollView,
    TouchableOpacity,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "./components/layout/header";
import ExerciseLibraryPanel from "./exercise-library-panel";
import { HEADER_SCROLL_DISTANCE, useHeaderAnimations } from "./hooks/use-header-animations";
import WorkoutBuilderPanel from "./workout-builder-panel";

const SCREEN_WIDTH = Dimensions.get("window").width * 0.9;

export function ProgramBuilder() {
    const insets = useSafeAreaInsets();

    const [sessionName, setSessionName] = useState("");

    const scrollY = useRef(new Animated.Value(0)).current;
    const { headerHeight } = useHeaderAnimations(scrollY);

    const exerciseListRef = useRef<ScrollView>(null);

    const handleScrollToTop = () => exerciseListRef.current?.scrollTo({ y: 0, animated: true });

    const handleAddAction = () => {
        // TODO: Implémenter les actions du bouton +
    };

    return (
        <View className="flex-1 bg-base-primary-light dark:bg-base-primary-dark">
            <Header
                scrollY={scrollY}
                sessionName={sessionName}
                onSessionNameChange={setSessionName}
            />

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
                        <ExerciseLibraryPanel 
                            currentHeaderHeight={Animated.add(headerHeight, insets.top + 20)} 
                            headerScrollDistance={HEADER_SCROLL_DISTANCE} 
                            scrollY={scrollY} 
                            scrollViewRef={exerciseListRef} 
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

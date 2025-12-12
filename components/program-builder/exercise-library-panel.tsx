import { GridIcon, ListIcon } from "@/components/ui/icons";
import { Caption } from "@/components/ui/typography";
import { useTranslation } from "@/i18n";
import { FlashList, FlashListRef } from "@shopify/flash-list";
import { useCallback, useMemo, useState } from "react";
import { Animated as RNAnimated, TouchableOpacity, View } from "react-native";
import { ExerciseCard } from "./components/exercise-card";

type AnimatedValue = number | RNAnimated.AnimatedAddition<number> | RNAnimated.AnimatedInterpolation<number>;
type DisplayMode = "grid" | "list";

const EXERCISES: any = [
    {
        id: 1,
        name: "Squat à la barre",
        muscles: [
            {
                id: "1",
                name: "Quadriceps",
                type: "primary",
                area: "lower",
                perspective: "front",
            },
            {
                id: "2",
                name: "Adductors",
                type: "secondary",
                area: "lower",
                perspective: "front",
            },
            {
                id: "3",
                name: "Hamstrings",
                type: "secondary",
                area: "lower",
                perspective: "back",
            },
        ],
        icon: "🦵",
    },
    {
        id: 2,
        name: "Développé couché sur banc incliné",
        muscles: [
            {
                id: "1",
                name: "Chest",
                type: "primary",
                area: "upper",
                perspective: "front",
            },
            {
                id: "2",
                name: "Deltoids",
                type: "secondary",
                area: "upper",
                perspective: "front",
            },
            {
                id: "3",
                name: "Triceps",
                type: "secondary",
                area: "upper",
                perspective: "back",
            },
        ],
        icon: "🏋️",
    },
    {
        id: 3,
        name: "Extension triceps à la poulie",
        muscles: [
            {
                id: "1",
                name: "Triceps",
                type: "primary",
                area: "upper",
                perspective: "back",
            },
            {
                id: "2",
                name: "Deltoids",
                type: "secondary",
                area: "upper",
                perspective: "front",
            },
        ],
        icon: "🏋️",
    },
    {
        id: 4,
        name: "Curl marteau aux haltères",
        muscles: [
            {
                id: "1",
                name: "Biceps",
                type: "primary",
                area: "upper",
                perspective: "front",
            },
            {
                id: "2",
                name: "Forearm",
                type: "secondary",
                area: "upper",
                perspective: "back",
            },
        ]
    },
    {
        id: 5,
        name: "Développé couché sur banc incliné",
        muscles: [
            {
                id: "1",
                name: "Chest",
                type: "primary",
                area: "upper",
                perspective: "front",
            },
            {
                id: "2",
                name: "Deltoids",
                type: "secondary",
                area: "upper",
                perspective: "front",
            },
        ]
    },
    {
        id: 6,
        name: "Développé couché sur banc incliné",
        muscles: [
            {
                id: "1",
                name: "Chest",
                type: "primary",
                area: "upper",
                perspective: "front",
            },
            {
                id: "2",
                name: "Deltoids",
                type: "secondary",
                area: "upper",
                perspective: "front",
            },
            {
                id: "3",
                name: "Triceps",
                type: "secondary",
                area: "upper",
                perspective: "back",
            },
        ]
    }
];

type ExerciseLibraryPanelProps = {
    currentHeaderHeight: AnimatedValue;
    headerScrollDistance: number;
    scrollY: RNAnimated.Value;
    flashListRef?: React.RefObject<FlashListRef<any> | null>;
};

const ExerciseLibraryPanel: React.FC<ExerciseLibraryPanelProps> = ({ 
    currentHeaderHeight, 
    headerScrollDistance, 
    scrollY, 
    flashListRef 
}) => {
    const { __ } = useTranslation();
    const [displayMode, setDisplayMode] = useState<DisplayMode>("grid");
    const isGrid = displayMode === "grid";

    const displayModeIcon = useMemo(() => {
        const iconClassName = "text-content-secondary-light dark:text-content-secondary-dark";

        return isGrid ? <ListIcon size={22} className={iconClassName} /> : <GridIcon size={22} className={iconClassName} />;
    }, [isGrid]);

    const toggleDisplayMode = useCallback(() => setDisplayMode(mode => (mode === "grid" ? "list" : "grid")), []);
    const keyExtractor = useCallback((item: any) => item.id.toString(), []);

    const renderItem = useCallback(({ item }: { item: any }) => (
        <ExerciseCard exercise={item} displayMode={displayMode} />
    ), [displayMode]);

    const ListHeaderComponent = useCallback(() => (
        <View>
            <RNAnimated.View style={{ height: currentHeaderHeight }} />
            <View className="flex-row items-center justify-between my-4">
                <Caption className="text-content-secondary-light dark:text-content-secondary-dark">
                    {__("Tous les exercices")}
                </Caption>

                <TouchableOpacity onPress={toggleDisplayMode}>
                    {displayModeIcon}
                </TouchableOpacity>
            </View>
        </View>
    ), [displayModeIcon, toggleDisplayMode]);

    const handleScroll = useMemo(() => 
        RNAnimated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
        ), 
    [scrollY]);

    return (
        <FlashList
            ref={flashListRef}
            data={EXERCISES}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            numColumns={isGrid ? 2 : 1}
            key={displayMode}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            ListHeaderComponent={ListHeaderComponent}
            contentContainerStyle={{
                paddingHorizontal: 16,
                paddingBottom: headerScrollDistance + 32,
            }}
        />
    );
};

export default ExerciseLibraryPanel;

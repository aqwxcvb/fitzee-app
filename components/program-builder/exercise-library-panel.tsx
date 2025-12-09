import { Caption } from "@/components/ui/typography";
import { useTranslation } from "@/i18n";
import { Animated, ScrollView } from "react-native";
import ExerciseCard from "./components/exercise-card";
import { Exercise } from "./types/exercise";

type AnimatedValue = number | Animated.AnimatedAddition<number> | Animated.AnimatedInterpolation<number>;

const EXERCISES = [
    {
        id: "1",
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
        id: "2",
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
        id: "3",
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
        id: "4",
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
        id: "5",
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
    },
    {
        id: "6",
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
] as Exercise[];

const ExerciseLibraryPanel: React.FC<{ currentHeaderHeight: AnimatedValue, headerScrollDistance: number, scrollY: Animated.Value, scrollViewRef?: React.RefObject<ScrollView | null> }> = ({ currentHeaderHeight, headerScrollDistance, scrollY, scrollViewRef }) => {
    const { __ } = useTranslation();

    return (
        <Animated.ScrollView
            ref={scrollViewRef}
            className="flex-1 p-4"
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            bounces={false}
            overScrollMode="never"
            onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                { useNativeDriver: false }
            )}
            contentContainerStyle={{
                flexGrow: 1,
                paddingBottom: headerScrollDistance,
            }}
        >
            <Animated.View style={{ height: currentHeaderHeight }} />
            
            <Caption className="text-content-secondary-light dark:text-content-secondary-dark">
                {__("Tous les exercices")}
            </Caption>

            {EXERCISES.map((exercise) => (
                <ExerciseCard key={exercise.id} exercise={exercise} />
            ))}
        </Animated.ScrollView>
    );
};

export default ExerciseLibraryPanel;
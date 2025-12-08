import { Caption } from "@/components/ui/typography";
import { useTranslation } from "@/i18n";
import { Animated } from "react-native";
import ExerciseCard from "./components/exercise-card";
import { Exercise } from "./types/exercise";

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
    }
] as Exercise[];

const ExerciseLibraryPanel: React.FC<{ headerScrollDistance: number, scrollY: Animated.Value }> = ({ headerScrollDistance, scrollY }) => {
    const { __ } = useTranslation();

    return (
        <Animated.ScrollView
            className="flex-1 bg-base-light dark:bg-base-dark border-r border-neutral-200 dark:border-neutral-800 p-4"
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            bounces={false}
            overScrollMode="never"
            onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                { useNativeDriver: false }
            )}
            contentContainerStyle={{
                paddingBottom: headerScrollDistance,
            }}
        >
            <Caption>
                {__("Tous les exercices")}
            </Caption>

            {EXERCISES.map((exercise) => (
                <ExerciseCard key={exercise.id} exercise={exercise} />
            ))}
        </Animated.ScrollView>
    );
};

export default ExerciseLibraryPanel;
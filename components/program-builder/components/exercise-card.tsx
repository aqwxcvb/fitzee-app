import { Headline } from "@/components/ui/typography";
import { Pressable, View } from "react-native";
import { Exercise } from "../types/exercise";
import BodyHeatmap from "./body-heatmap";
import { MuscleBadge } from "./muscle-badge";

const ExerciseCard = ({ exercise }: { exercise: Exercise }) => {
    return (
        <Pressable className="my-2 p-4 flex flex-row items-center bg-surface-primary-light dark:bg-surface-primary-dark rounded-xl" style={{
            height: 140,
        }}>
            <View className="w-24 h-24 items-center overflow-hidden mr-4">
                <BodyHeatmap muscles={exercise.muscles} />
            </View>
            <View className="flex-1 h-full flex justify-center gap-3">
                <Headline numberOfLines={2} className="text-content-primary-light dark:text-content-primary-dark">
                    {exercise.name}
                </Headline>
                <View className="flex flex-row flex-wrap gap-2">
                    {exercise.muscles.map(muscle => (
                        <MuscleBadge key={muscle.id} muscle={muscle} />
                    ))}
                </View>
            </View>
        </Pressable>
    );
};

export default ExerciseCard;
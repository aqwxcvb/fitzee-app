import { WorkoutBuilderPanel } from "@/components/program-builder/workout-builder-panel copy";
import { useState } from "react";
import { SafeAreaView, useColorScheme, View } from "react-native";

export interface Exercise {
    key: string;
    id: string;
    name: string;
    muscle: string;
    icon: string;
    // Pour les groupes (supersets)
    type?: 'exercise' | 'group';
    children?: Exercise[];
}

// Mock data
export const EXERCISES: Exercise[] = [
    { key: "1", id: "1", name: "Bench Press", muscle: "Pectoraux", icon: "solar:dumbbell-small-outline" },
    { key: "2", id: "2", name: "Squat", muscle: "Jambes", icon: "solar:dumbbell-small-outline" },
    { key: "3", id: "3", name: "Deadlift", muscle: "Dos", icon: "solar:dumbbell-small-outline" },
    { key: "4", id: "4", name: "Pull-ups", muscle: "Dos", icon: "solar:dumbbell-small-outline" },
    { key: "5", id: "5", name: "Shoulder Press", muscle: "Épaules", icon: "solar:dumbbell-small-outline" },
    { key: "6", id: "6", name: "Lunges", muscle: "Jambes", icon: "solar:dumbbell-small-outline" },
    { key: "7", id: "7", name: "Bicep Curl", muscle: "Biceps", icon: "solar:dumbbell-small-outline" },
    { key: "8", id: "8", name: "Tricep Extension", muscle: "Triceps", icon: "solar:dumbbell-small-outline" },
    { key: "9", id: "9", name: "Leg Press", muscle: "Jambes", icon: "solar:dumbbell-small-outline" },
    { key: "10", id: "10", name: "Leg Curl", muscle: "Jambes", icon: "solar:dumbbell-small-outline" },
    { key: "11", id: "11", name: "Calf Raise", muscle: "Mollets", icon: "solar:dumbbell-small-outline" },
    { key: "12", id: "12", name: "Chest Fly", muscle: "Pectoraux", icon: "solar:dumbbell-small-outline" },
    { key: "13", id: "13", name: "Lat Pulldown", muscle: "Dos", icon: "solar:dumbbell-small-outline" },
    { key: "14", id: "14", name: "Face Pull", muscle: "Épaules", icon: "solar:dumbbell-small-outline" },
    { key: "15", id: "15", name: "Crunch", muscle: "Abdominaux", icon: "solar:dumbbell-small-outline" },
    { key: "16", id: "16", name: "Russian Twist", muscle: "Abdominaux", icon: "solar:dumbbell-small-outline" },
];


export default function Example() {
    const [exercises, setExercises] = useState<Exercise[]>(EXERCISES);
    const [isDragging, setIsDragging] = useState(false);
    const isDark = useColorScheme() === "dark";
    
    return (
        <SafeAreaView className="flex-1 bg-base-primary-light dark:bg-base-primary-dark"> 
            <View className="flex-1 p-4">
                <WorkoutBuilderPanel exercises={exercises} setExercises={setExercises} setIsDragging={setIsDragging} isDark={isDark} />
            </View>
        </SafeAreaView>
    );
}
import { Body, Headline, Title } from "@/components/ui/typography";
import { Monicon } from "@monicon/native";
import React, { memo } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";

// Types
export interface Exercise {
    key: string;
    id: string;
    name: string;
    muscle: string;
    icon: string;
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

// Styles
const styles = StyleSheet.create({
    panel: { flex: 1 },
});

const getShadow = (isDark: boolean): ViewStyle => ({
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.08,
    shadowRadius: 8,
});

// Components
const ExerciseCard = memo(({ exercise, isSelected, isDark, onPress }: {
    exercise: Exercise;
    isSelected: boolean;
    isDark: boolean;
    onPress: () => void;
}) => (
    <TouchableOpacity
        onPress={onPress}
        disabled={isSelected}
        activeOpacity={0.7}
        className={`p-4 rounded-2xl flex-row items-center gap-4 ${isSelected ? "bg-accent-light/50 dark:bg-accent-dark/50 opacity-50" : "bg-surface-light dark:bg-surface-dark"}`}
        style={!isSelected ? getShadow(isDark) : undefined}
    >
        <View className="w-12 h-12 rounded-xl bg-accent-light dark:bg-accent-dark items-center justify-center">
            <Monicon name={exercise.icon} size={24} color={isDark ? "#fff" : "#1c1c1e"} />
        </View>
        <View className="flex-1">
            <Headline>{exercise.name}</Headline>
            <Body>{exercise.muscle}</Body>
        </View>
        <Monicon
            name={isSelected ? "solar:check-circle-bold" : "solar:add-circle-bold"}
            size={28}
            color={isSelected ? (isDark ? "#30d158" : "#34c759") : (isDark ? "#0A84FF" : "#007AFF")}
        />
    </TouchableOpacity>
));

interface ExerciseLibraryPanelProps {
    selectedIds: Set<string>;
    isDark: boolean;
    onAddExercise: (exercise: Exercise) => void;
    style?: ViewStyle;
}

export function ExerciseLibraryPanel({ selectedIds, isDark, onAddExercise, style }: ExerciseLibraryPanelProps) {
    return (
        <View style={[styles.panel, style]} className="bg-base-light dark:bg-base-dark pt-4">
            <Title className="px-5 mb-4">Exercices</Title>
            <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false} nestedScrollEnabled>
                <View className="gap-3 pb-8">
                    {EXERCISES.map(ex => (
                        <ExerciseCard
                            key={ex.id}
                            exercise={ex}
                            isSelected={selectedIds.has(ex.id)}
                            isDark={isDark}
                            onPress={() => onAddExercise(ex)}
                        />
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

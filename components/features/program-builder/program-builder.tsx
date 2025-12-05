import { AutoScrollView } from "@/components/ui/auto-scroll-view";
import { Body, Headline, Title } from "@/components/ui/typography";
import { AutoScrollProvider, useAutoScroll } from "@/contexts";
import { Monicon } from "@monicon/native";
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity, useColorScheme, View, ViewStyle } from "react-native";
import { DraggableGrid } from "react-native-draggable-grid";

// Constants
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PANEL_WIDTH = SCREEN_WIDTH * 0.90;

// Types
interface Exercise {
    key: string;
    id: string;
    name: string;
    muscle: string;
    icon: string;
}

// Mock data
const EXERCISES: Exercise[] = [
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
    panel: { width: PANEL_WIDTH },
    content: { width: PANEL_WIDTH * 2 },
    grid: { paddingHorizontal: 12 },
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

const ProgramGrid = memo(({ exercises, setExercises, setIsDragging, isDark }: {
    exercises: Exercise[];
    setExercises: React.Dispatch<React.SetStateAction<Exercise[]>>;
    setIsDragging: (val: boolean) => void;
    isDark: boolean;
}) => {
    const gridRef = useRef<any>(null);
    const [isDraggingLocal, setIsDraggingLocal] = useState(false);
    const { handleDragMove, handleDragEnd, registerScrollOffsetHandler } = useAutoScroll();
    const shadow = useMemo(() => getShadow(isDark), [isDark]);

    useEffect(() => {
        registerScrollOffsetHandler((deltaY) => gridRef.current?.applyScrollOffset(deltaY));
        return () => registerScrollOffsetHandler(null);
    }, [registerScrollOffsetHandler]);

    const handleDragStart = useCallback(() => {
        setIsDragging(true);
        setIsDraggingLocal(true);
    }, [setIsDragging]);

    const handleDragRelease = useCallback((data: Exercise[]) => {
        handleDragEnd();
        setExercises(data);
        setIsDragging(false);
        setIsDraggingLocal(false);
    }, [handleDragEnd, setExercises, setIsDragging]);

    const handleItemDelete = useCallback((ex: Exercise) => {
        setExercises(prev => prev.filter(e => e.key !== ex.key));
    }, [setExercises]);

    const renderItem = useCallback((item: Exercise, idx: number) => (
        <View className="flex-1 m-2 p-4 rounded-2xl bg-surface-light dark:bg-surface-dark" style={shadow}>
            <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-lg bg-primary-light dark:bg-primary-dark items-center justify-center">
                    <Headline className="text-white text-sm">{idx + 1}</Headline>
                </View>
                <View className="flex-1">
                    <Headline className="text-sm" numberOfLines={1}>{item.name}</Headline>
                    <Body className="text-xs">{item.muscle}</Body>
                </View>
            </View>
        </View>
    ), [shadow]);

    const renderDeleteButton = useCallback((_: Exercise, onDelete: () => void) => (
        <TouchableOpacity
            onPress={onDelete}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 items-center justify-center"
        >
            <Monicon name="solar:close-circle-bold" size={16} color="#fff" />
        </TouchableOpacity>
    ), []);

    return (
        <AutoScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            scrollEnabled={!isDraggingLocal}
            nestedScrollEnabled
        >
            <DraggableGrid
                ref={gridRef}
                data={exercises}
                numColumns={1}
                itemHeight={100}
                renderItem={renderItem}
                renderDeleteButton={renderDeleteButton}
                enableJiggle={false}
                onDragStart={handleDragStart}
                onDragging={handleDragMove}
                onDragRelease={handleDragRelease}
                onItemDelete={handleItemDelete}
                delayLongPress={300}
                style={styles.grid}
            />
        </AutoScrollView>
    );
});

const EmptyState = memo(({ isDark }: { isDark: boolean }) => (
    <View className="flex-1 items-center justify-center px-8">
        <Monicon name="solar:clipboard-list-outline" size={64} color={isDark ? "#3a3a3c" : "#d1d1d6"} />
        <Headline className="mt-4 text-center text-content-light dark:text-content-dark">
            Aucun exercice
        </Headline>
        <Body className="mt-2 text-center">
            Swipe vers la gauche pour ajouter des exercices
        </Body>
    </View>
));

export function ProgramBuilder() {
    const isDark = useColorScheme() === "dark";
    const [selected, setSelected] = useState<Exercise[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    const selectedIds = useMemo(() => new Set(selected.map(e => e.id)), [selected]);

    const addExercise = useCallback((ex: Exercise) => {
        setSelected(prev => {
            if (prev.find(e => e.id === ex.id)) return prev;
            return [...prev, { ...ex, key: `sel-${ex.id}-${Date.now()}` }];
        });
    }, []);

    return (
        <View className="flex-1 bg-base-light dark:bg-base-dark">
            <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                decelerationRate="fast"
                snapToInterval={PANEL_WIDTH}
                snapToAlignment="start"
                scrollEnabled={!isDragging}
                contentContainerStyle={styles.content}
            >
                {/* Left Panel - Exercises */}
                <View style={styles.panel} className="bg-base-light dark:bg-base-dark pt-4">
                    <Title className="px-5 mb-4">Exercices</Title>
                    <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false} nestedScrollEnabled>
                        <View className="gap-3 pb-8">
                            {EXERCISES.map(ex => (
                                <ExerciseCard
                                    key={ex.id}
                                    exercise={ex}
                                    isSelected={selectedIds.has(ex.id)}
                                    isDark={isDark}
                                    onPress={() => addExercise(ex)}
                                />
                            ))}
                        </View>
                    </ScrollView>
                </View>

                {/* Right Panel - Program */}
                <View style={styles.panel} className="bg-foreground-light dark:bg-foreground-dark pt-4">
                    <View className="flex-row items-center gap-3 px-5 mb-4">
                        <Title>Programme</Title>
                        <View className="w-7 h-7 rounded-full bg-primary-light dark:bg-primary-dark items-center justify-center">
                            <Headline className="text-white text-xs">{selected.length}</Headline>
                        </View>
                    </View>

                    {selected.length === 0 ? (
                        <EmptyState isDark={isDark} />
                    ) : (
                        <AutoScrollProvider>
                            <ProgramGrid
                                exercises={selected}
                                setExercises={setSelected}
                                setIsDragging={setIsDragging}
                                isDark={isDark}
                            />
                        </AutoScrollProvider>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

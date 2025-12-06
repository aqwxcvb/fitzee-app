import { AutoScrollView } from "@/components/ui/auto-scroll-view";
import { Body, Headline, Title } from "@/components/ui/typography";
import { AutoScrollProvider, useAutoScroll } from "@/contexts";
import { Monicon } from "@monicon/native";
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";
import { DraggableGrid } from "react-native-draggable-grid";
import { Exercise } from "./exercise-library-panel";

// Styles
const styles = StyleSheet.create({
    panel: { flex: 1 },
    grid: { paddingHorizontal: 12 },
});

const getShadow = (isDark: boolean): ViewStyle => ({
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.08,
    shadowRadius: 8,
});

// Components
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

    const handleGroupCreate = useCallback((items: Exercise[], targetItem: Exercise) => {
        console.log("🎯 Groupe créé avec:", items.map(i => i.name));
        // TODO: Implémenter la logique de création de groupe/superset
        // Pour l'instant, on log juste pour tester que ça fonctionne
    }, []);

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
                enableGrouping={true}
                onGroupCreate={handleGroupCreate}
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

interface WorkoutBuilderPanelProps {
    exercises: Exercise[];
    setExercises: React.Dispatch<React.SetStateAction<Exercise[]>>;
    setIsDragging: (val: boolean) => void;
    isDark: boolean;
    style?: ViewStyle;
}

export function WorkoutBuilderPanel({ exercises, setExercises, setIsDragging, isDark, style }: WorkoutBuilderPanelProps) {
    return (
        <View style={[styles.panel, style]} className="bg-foreground-light dark:bg-foreground-dark pt-4">
            <View className="flex-row items-center gap-3 px-5 mb-4">
                <Title>Programme</Title>
                <View className="w-7 h-7 rounded-full bg-primary-light dark:bg-primary-dark items-center justify-center">
                    <Headline className="text-white text-xs">{exercises.length}</Headline>
                </View>
            </View>

            {exercises.length === 0 ? (
                <EmptyState isDark={isDark} />
            ) : (
                <AutoScrollProvider>
                    <ProgramGrid
                        exercises={exercises}
                        setExercises={setExercises}
                        setIsDragging={setIsDragging}
                        isDark={isDark}
                    />
                </AutoScrollProvider>
            )}
        </View>
    );
}


import React, { useCallback, useMemo, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, useColorScheme, View } from "react-native";
import { Exercise, ExerciseLibraryPanel } from "./exercise-library-panel";
import { WorkoutBuilderPanel } from "./workout-builder-panel";

// Constants
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PANEL_WIDTH = SCREEN_WIDTH * 0.90;

// Styles
const styles = StyleSheet.create({
    panel: { width: PANEL_WIDTH },
    content: { width: PANEL_WIDTH * 2 },
});

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
                <ExerciseLibraryPanel
                    selectedIds={selectedIds}
                    isDark={isDark}
                    onAddExercise={addExercise}
                    style={styles.panel}
                />

                <WorkoutBuilderPanel
                    exercises={selected}
                    setExercises={setSelected}
                    setIsDragging={setIsDragging}
                    isDark={isDark}
                    style={styles.panel}
                />
            </ScrollView>
        </View>
    );
}

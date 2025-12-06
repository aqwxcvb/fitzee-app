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

// Composant pour le contenu d'un groupe avec drag and drop interne
const GroupContent = memo(({ 
    group, 
    isDark, 
    shadow,
    onChildrenReorder,
    onItemDragOutside
}: {
    group: Exercise;
    isDark: boolean;
    shadow: ViewStyle;
    onChildrenReorder: (groupKey: string, newChildren: Exercise[]) => void;
    onItemDragOutside: (groupKey: string, item: Exercise) => void;
}) => {
    const handleDragRelease = useCallback((newData: Exercise[]) => {
        onChildrenReorder(group.key, newData);
    }, [group.key, onChildrenReorder]);
    
    const handleDragOutside = useCallback((item: Exercise) => {
        onItemDragOutside(group.key, item);
    }, [group.key, onItemDragOutside]);
    
    const renderChildItem = useCallback((child: Exercise, childIdx: number) => (
        <View className="p-3 rounded-xl bg-surface-light dark:bg-surface-dark mx-1 my-0.5">
            <View className="flex-row items-center gap-3">
                <View className="w-6 h-6 rounded-md bg-primary-light dark:bg-primary-dark items-center justify-center">
                    <Body className="text-white text-xs">{childIdx + 1}</Body>
                </View>
                <View className="flex-1">
                    <Headline className="text-sm" numberOfLines={1}>{child.name}</Headline>
                    <Body className="text-xs">{child.muscle}</Body>
                </View>
            </View>
        </View>
    ), []);
    
    if (!group.children) return null;
    
    const itemHeight = 52;
    const gridHeight = group.children.length * itemHeight;
    
    return (
        <View className="flex-1 m-2 p-2 rounded-2xl bg-accent-light/20 dark:bg-accent-dark/20 border-2 border-dashed border-accent-light dark:border-accent-dark" style={shadow}>
            <View className="flex-row items-center gap-2 mb-2 px-2">
                <Monicon name="solar:layers-bold" size={16} color={isDark ? "#0A84FF" : "#007AFF"} />
                <Body className="text-xs text-accent-light dark:text-accent-dark">Superset • {group.children.length} exercices</Body>
            </View>
            <View style={{ height: gridHeight }}>
                <DraggableGrid
                    data={group.children}
                    numColumns={1}
                    itemHeight={itemHeight}
                    renderItem={renderChildItem}
                    enableJiggle={false}
                    enableGrouping={false}
                    onDragRelease={handleDragRelease}
                    onDragOutside={handleDragOutside}
                    delayLongPress={200}
                />
            </View>
        </View>
    );
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

    // Calculer la hauteur de chaque item dynamiquement
    const getItemHeight = useCallback((item: Exercise): number => {
        const BASE_HEIGHT = 100; // Hauteur de base pour un exercice
        const GROUP_HEADER_HEIGHT = 40; // Hauteur du header du groupe
        const CHILD_HEIGHT = 52; // Hauteur d'un enfant dans un groupe
        const GROUP_PADDING = 20; // Padding du groupe (top + bottom)
        
        if (item.type === 'group' && item.children) {
            return GROUP_HEADER_HEIGHT + (item.children.length * CHILD_HEIGHT) + GROUP_PADDING;
        }
        return BASE_HEIGHT;
    }, []);

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

    const handleChildrenReorder = useCallback((groupKey: string, newChildren: Exercise[]) => {
        setExercises(prev => prev.map(item => {
            if (item.key === groupKey && item.type === 'group') {
                return { ...item, children: newChildren };
            }
            return item;
        }));
    }, [setExercises]);

    const handleItemDragOutside = useCallback((groupKey: string, item: Exercise) => {
        setExercises(prev => {
            // Trouver le groupe
            const groupIndex = prev.findIndex(e => e.key === groupKey);
            if (groupIndex === -1) return prev;
            
            const group = prev[groupIndex];
            if (!group.children) return prev;
            
            // Retirer l'item du groupe
            const newChildren = group.children.filter(c => c.key !== item.key);
            
            // Si le groupe n'a plus qu'un seul élément, le dissoudre
            if (newChildren.length <= 1) {
                const remainingItem = newChildren[0];
                const newExercises = [...prev];
                // Remplacer le groupe par l'item restant (s'il y en a un)
                if (remainingItem) {
                    newExercises.splice(groupIndex, 1, remainingItem);
                } else {
                    // Si le groupe est vide, le supprimer
                    newExercises.splice(groupIndex, 1);
                }
                // Ajouter l'item retiré après la position du groupe
                newExercises.splice(groupIndex + 1, 0, item);
                return newExercises;
            }
            
            // Sinon, mettre à jour le groupe et ajouter l'item à la liste principale
            const newExercises = [...prev];
            newExercises[groupIndex] = { ...group, children: newChildren };
            // Ajouter l'item retiré après le groupe
            newExercises.splice(groupIndex + 1, 0, item);
            return newExercises;
        });
    }, [setExercises]);

    const handleGroupCreate = useCallback((items: Exercise[], targetItem: Exercise) => {        
        setExercises(prev => {
            // Trouver les clés des items à grouper
            const draggedItem = items.find(i => i.key !== targetItem.key);
            if (!draggedItem) return prev;
            
            // Vérifier si la cible est déjà un groupe
            const isTargetGroup = targetItem.type === 'group';
            
            // Créer le nouveau groupe ou ajouter au groupe existant
            let newGroup: Exercise;
            if (isTargetGroup && targetItem.children) {
                // Ajouter au groupe existant
                newGroup = {
                    ...targetItem,
                    children: [...targetItem.children, draggedItem],
                };
            } else {
                // Créer un nouveau groupe
                newGroup = {
                    key: `group-${Date.now()}`,
                    id: `group-${Date.now()}`,
                    name: 'Superset',
                    muscle: '',
                    icon: 'solar:layers-bold',
                    type: 'group',
                    children: [targetItem, draggedItem],
                };
            }
            
            // Filtrer les items originaux et ajouter le groupe
            const filtered = prev.filter(e => e.key !== draggedItem.key && e.key !== targetItem.key);
            
            // Insérer le groupe à la position de la cible
            const targetIndex = prev.findIndex(e => e.key === targetItem.key);
            filtered.splice(targetIndex, 0, newGroup);
            
            return filtered;
        });
    }, [setExercises]);

    const renderItem = useCallback((item: Exercise, idx: number) => {
        // Rendu pour les groupes (supersets) avec DraggableGrid imbriqué
        if (item.type === 'group' && item.children) {
            return (
                <GroupContent
                    group={item}
                    isDark={isDark}
                    shadow={shadow}
                    onChildrenReorder={handleChildrenReorder}
                    onItemDragOutside={handleItemDragOutside}
                />
            );
        }
        
        // Rendu normal pour les exercices individuels
        return (
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
        );
    }, [shadow, isDark, handleChildrenReorder, handleItemDragOutside]);

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
                getItemHeight={getItemHeight}
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


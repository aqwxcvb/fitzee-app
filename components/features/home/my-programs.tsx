import { useAutoScroll } from "@/contexts/auto-scroll-context";
import { useTranslation } from "@/i18n";
import { Monicon } from "@monicon/native";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, PanResponderGestureState, Pressable, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { DraggableGrid, DraggableGridRef } from "react-native-draggable-grid";

interface Program {
    key: string;
    id: string;
    name: string;
    sessions: number;
    isAddButton?: boolean;
    disabledDrag?: boolean;
    disabledReSorted?: boolean;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const PARENT_PADDING = 40;
const GAP = 12;
const ITEM_HEIGHT = 140;
const ITEM_WIDTH = (SCREEN_WIDTH - PARENT_PADDING - GAP) / 2;

interface MyProgramsProps {
    onChangeScrollEnable?: (enabled: boolean) => void;
}

export function MyPrograms({ onChangeScrollEnable }: MyProgramsProps) {
    const { handleDragMove, handleDragEnd, registerScrollOffsetHandler } = useAutoScroll();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const iconColor = isDark ? "white" : "black";
    const { __ } = useTranslation();

    const [programs, setPrograms] = useState<Program[]>([
        { key: "1", id: "1", name: "Full Body", sessions: 3 },
        { key: "2", id: "2", name: "PPL", sessions: 3 },
        { key: "3", id: "3", name: "Split", sessions: 3 },
        { key: "4", id: "4", name: "Upper Body", sessions: 3 },
        { key: "5", id: "5", name: "Lower Body", sessions: 3 },
        { key: "6", id: "6", name: "Core", sessions: 3 },
        { key: "7", id: "7", name: "Cardio", sessions: 3 },
        { key: "8", id: "8", name: "Flexibility", sessions: 3 },
        { key: "9", id: "9", name: "Strength", sessions: 3 },
        { key: "10", id: "10", name: "Endurance", sessions: 3 },
        { key: "add-button", id: "add-button", name: "", sessions: 0, isAddButton: true, disabledDrag: true, disabledReSorted: true },
    ]);

    const gridRef = useRef<DraggableGridRef>(null);
    const [isEditMode, setIsEditMode] = useState(false);

    // Enregistre le handler pour compenser le scroll pendant le drag
    useEffect(() => {
        registerScrollOffsetHandler((deltaY: number) => {
            gridRef.current?.applyScrollOffset(deltaY);
        });
        return () => {
            registerScrollOffsetHandler(null);
        };
    }, [registerScrollOffsetHandler]);

    const renderItem = useCallback((item: Program) => {
        if (item.isAddButton) {
            return (
                <View className="items-center justify-start" style={{ height: ITEM_HEIGHT + GAP }}>
                    <TouchableOpacity 
                        className="bg-primary border border-[#ff2d20] rounded-2xl p-5"
                        activeOpacity={0.98}
                        style={{
                            width: ITEM_WIDTH,
                            height: ITEM_HEIGHT,
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: isDark ? 0.3 : 0.15,
                            shadowRadius: 4,
                            elevation: 3,
                        }}
                    >
                        <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center mb-3">
                            <Monicon name="solar:add-circle-bold" size={28} color="white" />
                        </View>
                        <Text className="text-[17px] font-geist-semibold text-white">
                            {__("Nouveau programme")}
                        </Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <View className="items-center justify-start" style={{ height: ITEM_HEIGHT + GAP }}>
                <View 
                    className="bg-white dark:bg-[#1f1f1f] border border-[#e5e5e5] dark:border-[#2f2f2f] rounded-2xl p-5"
                    style={{
                        width: ITEM_WIDTH,
                        height: ITEM_HEIGHT,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: isDark ? 0.2 : 0.08,
                        shadowRadius: 3,
                        elevation: 2,
                    }}
                >
                    <View className="w-12 h-12 rounded-full bg-[#f5f5f5] dark:bg-[#2f2f2f] items-center justify-center mb-3">
                        <Monicon name="solar:dumbbell-small-outline" size={28} color={iconColor} />
                    </View>
                    <View className="gap-1">
                        <Text className="text-[17px] font-geist-semibold text-black dark:text-white">
                            {item.name}
                        </Text>
                        <Text className="text-[13px] text-[#666666] dark:text-[#a0a0a0]">
                            {item.sessions} {__("séances")}
                        </Text>
                    </View>
                </View>
            </View>
        );
    }, [iconColor, __, isDark]);

    const handleDragStart = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
        onChangeScrollEnable?.(false);
    }, [onChangeScrollEnable]);

    const handleDragRelease = useCallback((data: Program[]) => {
        onChangeScrollEnable?.(true);
        const addButton = data.find(item => item?.isAddButton);
        const programsWithoutButton = data.filter(item => item && !item.isAddButton);
        setPrograms(addButton ? [...programsWithoutButton, addButton] : programsWithoutButton);
        handleDragEnd();
    }, [onChangeScrollEnable, handleDragEnd]);

    const onDragging = useCallback((gestureState: PanResponderGestureState) => {
        handleDragMove(gestureState);
    }, [handleDragMove]);

    const handleEditModeChange = useCallback((editMode: boolean) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);

        setIsEditMode(editMode);
    }, []);

    const handlePressOutside = useCallback(() => {
        if (gridRef.current) {
            gridRef.current.exitEditMode();
        }
    }, []);

    const handleDeleteProgram = useCallback((item: Program) => {
        if (item.isAddButton) return;
        setPrograms((prev) => prev.filter((p) => p.id !== item.id));
    }, []);

    return (
        <View className="flex-1">
            {isEditMode && (
                <Pressable 
                    className="absolute -top-[1000px] -left-[1000px] bg-transparent z-[1]"
                    style={{ width: SCREEN_WIDTH + 2000, height: SCREEN_HEIGHT + 2000 }}
                    onPress={handlePressOutside} 
                />
            )}
            <DraggableGrid
                ref={gridRef}
                numColumns={2}
                style={{ flex: 1, zIndex: 2 }}
                itemHeight={ITEM_HEIGHT + GAP}
                renderItem={renderItem}
                data={programs}
                enableJiggle={true}
                onDragStart={handleDragStart}
                onDragging={onDragging}
                onDragRelease={handleDragRelease}
                onEditModeChange={handleEditModeChange}
                onItemDelete={handleDeleteProgram}
                renderDeleteButton={(item: Program, onDelete: () => void) => (
                    <TouchableOpacity
                        className="w-7 h-7 rounded-full items-center justify-center"
                        onPress={onDelete}
                        activeOpacity={0.7}
                        style={{
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.3,
                            shadowRadius: 4,
                            elevation: 5,
                        }}
                    >
                        <Monicon name="solar:minus-circle-outline" size={18} color="#ff3b30" />
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

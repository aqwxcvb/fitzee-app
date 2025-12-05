import { Body, Headline } from "@/components/ui/typography";
import { useAutoScroll } from "@/contexts/auto-scroll-context";
import { useTranslation } from "@/i18n";
import { Monicon } from "@monicon/native";
import * as Haptics from "expo-haptics";
import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import {
    Dimensions,
    PanResponderGestureState,
    Pressable,
    TouchableOpacity,
    useColorScheme,
    View
} from "react-native";
import {
    DraggableGrid,
    DraggableGridRef,
} from "react-native-draggable-grid";

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
    const iconColor = isDark ? "#ffffff" : "#1c1c1e";
    const { __ } = useTranslation();

    const [programs, setPrograms] = useState<Program[]>([
        { key: "1", id: "1", name: "Full Body", sessions: 3 },
        { key: "2", id: "2", name: "PPL", sessions: 3 },
        { key: "3", id: "3", name: "Split", sessions: 5 },
        {
            key: "add-button",
            id: "add-button",
            name: "",
            sessions: 0,
            isAddButton: true,
            disabledDrag: true,
            disabledReSorted: true,
        },
    ]);

    const gridRef = useRef<DraggableGridRef>(null);
    const [isEditMode, setIsEditMode] = useState(false);

    const cardShadowStyle = isDark
        ? {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.28,
              shadowRadius: 16,
              elevation: 4,
          }
        : {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 1,
          };

    const deleteButtonShadow = {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    };

    useEffect(() => {
        registerScrollOffsetHandler((deltaY: number) => {
            gridRef.current?.applyScrollOffset(deltaY);
        });

        return () => {
            registerScrollOffsetHandler(null);
        };
    }, [registerScrollOffsetHandler]);

    const renderItem = useCallback(
        (item: Program) => {
            if (item.isAddButton) {
                return (
                    <View
                        className="items-center justify-start"
                        style={{ height: ITEM_HEIGHT + GAP }}
                    >
                        <TouchableOpacity
                            className="bg-primary-light dark:bg-primary-dark rounded-[14px] p-4 gap-4"
                            activeOpacity={0.98}
                            style={[{ width: ITEM_WIDTH, height: ITEM_HEIGHT }, cardShadowStyle]}
                        >
                            <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
                                <Monicon
                                    name="solar:add-circle-bold"
                                    size={24}
                                    color="#ffffff"
                                />
                            </View>
                            <Headline className="text-white">
                                {__("Nouveau programme")}
                            </Headline>
                        </TouchableOpacity>
                    </View>
                );
            }

            return (
                <View
                    className="items-center justify-start"
                    style={{ height: ITEM_HEIGHT + GAP }}
                >
                    <View
                        className="rounded-[14px] p-4 bg-surface-light dark:bg-surface-dark gap-4"
                        style={[{ width: ITEM_WIDTH, height: ITEM_HEIGHT }, cardShadowStyle]}
                    >
                        <View className="w-10 h-10 rounded-full bg-accent-light dark:bg-accent-dark items-center justify-center">
                            <Monicon
                                name="solar:dumbbell-small-outline"
                                size={24}
                                color={iconColor}
                            />
                        </View>
                        <View className="gap-1">
                            <Headline className="line-clamp-1">
                                {item.name}
                            </Headline>
                            <Body>
                                {item.sessions} {__("séances")}
                            </Body>
                        </View>
                    </View>
                </View>
            );
        },
        [iconColor, __, cardShadowStyle],
    );

    const handleDragStart = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
        onChangeScrollEnable?.(false);
    }, [onChangeScrollEnable]);

    const handleDragRelease = useCallback(
        (data: Program[]) => {
            onChangeScrollEnable?.(true);

            const addButton = data.find((item) => item?.isAddButton);
            const programsWithoutButton = data.filter((item) => item && !item.isAddButton);

            setPrograms(addButton ? [...programsWithoutButton, addButton] : programsWithoutButton);
            handleDragEnd();
        },
        [onChangeScrollEnable, handleDragEnd],
    );

    const onDragging = useCallback(
        (gestureState: PanResponderGestureState) => {
            handleDragMove(gestureState);
        },
        [handleDragMove],
    );

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
                    >
                        <Monicon
                            name="solar:minus-circle-outline"
                            size={18}
                            color="#ff3b30"
                        />
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

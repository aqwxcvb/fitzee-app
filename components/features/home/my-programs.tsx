import { Body, Headline } from "@/components/ui/typography";
import { useAutoScroll } from "@/contexts/auto-scroll-context";
import { useTranslation } from "@/i18n";
import { Monicon } from "@monicon/native";
import * as Haptics from "expo-haptics";
import {
    useCallback,
    useEffect,
    useRef,
    useState
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
    DraggableGridRef
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
    const iconColor = isDark ? "#F5F6FA" : "#15161A";
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
            disabledReSorted: true
        }
    ]);

    const gridRef = useRef<DraggableGridRef>(null);
    const [isEditMode, setIsEditMode] = useState(false);

    /**
     * NOTE : Toutes les ombres ont été supprimées.
     * La profondeur est gérée exclusivement par les surfaces (palette).
     */

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
                            className="rounded-[14px] p-4 gap-4 bg-surface-primary-light dark:bg-surface-primary-dark"
                            activeOpacity={0.9}
                            style={{ width: ITEM_WIDTH, height: ITEM_HEIGHT }}
                        >
                            <View className="w-10 h-10 rounded-full bg-accent-primary-light dark:bg-accent-primary-dark items-center justify-center">
                                <Monicon
                                    name="solar:add-circle-bold"
                                    size={24}
                                    color="#ffffff"
                                />
                            </View>

                            <Headline className="text-content-primary-light dark:text-content-primary-dark">
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
                        className="rounded-[14px] p-4 gap-4 bg-surface-primary-light dark:bg-surface-primary-dark"
                        style={{ width: ITEM_WIDTH, height: ITEM_HEIGHT }}
                    >
                        <View className="w-10 h-10 rounded-full bg-surface-primary-muted-light dark:bg-surface-primary-muted-dark items-center justify-center">
                            <Monicon
                                name="solar:dumbbell-small-outline"
                                size={24}
                                color={iconColor}
                            />
                        </View>

                        <View className="gap-1">
                            <Headline className="line-clamp-1 text-content-primary-light dark:text-content-primary-dark">
                                {item.name}
                            </Headline>
                            <Body className="text-content-secondary-light dark:text-content-secondary-dark">
                                {item.sessions} {__("séances")}
                            </Body>
                        </View>
                    </View>
                </View>
            );
        },
        [iconColor, __]
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
        [onChangeScrollEnable, handleDragEnd]
    );

    const onDragging = useCallback(
        (gestureState: PanResponderGestureState) => {
            handleDragMove(gestureState);
        },
        [handleDragMove]
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
                        className="w-7 h-7 flex items-center justify-center"
                        onPress={onDelete}
                        activeOpacity={0.8}
                    >
                        <Monicon
                            name="solar:minus-circle-outline"
                            size={18}
                            color="#FF3B30"
                        />
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

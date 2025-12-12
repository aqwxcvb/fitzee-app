import { DraggableGrid } from "@/components/modules/draggable-grid";
import { Caption } from "@/components/ui/typography";
import { useTranslation } from "@/i18n";
import React, { useCallback, useMemo, useState } from "react";
import { Animated, Text, View } from "react-native";
import { GroupBlock } from "./components/workout-builder/group-block";
import { useGroupingHandlers } from "./hooks/use-grouping-handlers";
import { useNestedGrouping } from "./hooks/use-nested-grouping";
import type { WorkoutBuilderItem } from "./types";

type AnimatedValue =
    | number
    | Animated.AnimatedAddition<number>
    | Animated.AnimatedInterpolation<number>;

type DragScope =
    | { scope: "root" }
    | { scope: "group"; groupKey: string };

const makeColor = () =>
    `#${Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0")}`;

const WorkoutBuilderPanel: React.FC<{
    currentHeaderHeight: AnimatedValue;
    headerScrollDistance: number;
}> = ({ currentHeaderHeight, headerScrollDistance }) => {
    const { __ } = useTranslation();

    const initialItems = useMemo<WorkoutBuilderItem[]>(
        () =>
            Array.from({ length: 5 }, (_, index) => ({
                key: String(index),
                name: `Item ${index + 1}`,
                backgroundColor: makeColor(),
                isGroup: false,
                children: [],
            })),
        []
    );

    const [items, setItems] = useState<WorkoutBuilderItem[]>(initialItems);
    const [dragScope, setDragScope] = useState<DragScope>({ scope: "root" });

    const { onGroupCreate, onChildDragOutside } = useGroupingHandlers({ setItems });
    const { setGroupChildren } = useNestedGrouping(items, setItems);
    
    const onRootDragStart = useCallback(() => {
        setDragScope({ scope: "root" });
    }, []);

    const onRootDragRelease = useCallback(() => {
        setDragScope({ scope: "root" });
    }, []);

    const onGroupDragStart = useCallback((groupKey: string) => {
        setDragScope({ scope: "group", groupKey });
    }, []);

    const onGroupDragRelease = useCallback(() => {
        setDragScope({ scope: "root" });
    }, []);

    const renderRootItem = useCallback(
        (item: WorkoutBuilderItem) => {
            if (item.isGroup) {
                return (
                    <GroupBlock
                        group={item}
                        dragScope={dragScope}
                        onGroupDragStart={onGroupDragStart}
                        onGroupDragRelease={onGroupDragRelease}
                        setGroupChildren={setGroupChildren}
                        onChildDragOutside={onChildDragOutside}
                    />
                );
            }

            return (
                <View
                    style={{
                        paddingVertical: 16,
                        paddingHorizontal: 12,
                        backgroundColor: item.backgroundColor,
                        borderRadius: 12,
                        marginVertical: 8,
                    }}
                >
                    <Text style={{ color: "black", fontSize: 14, fontWeight: "600" }}>
                        {item.name}
                    </Text>
                </View>
            );
        },
        [
            dragScope,
            onChildDragOutside,
            onGroupDragRelease,
            onGroupDragStart,
            setGroupChildren,
        ]
    );

    return (
        <Animated.ScrollView
            className="flex-1 p-4"
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            bounces={false}
            overScrollMode="never"
            contentContainerStyle={{
                flexGrow: 1,
                paddingBottom: headerScrollDistance,
            }}
        >
            <Animated.View style={{ height: currentHeaderHeight }} />

            <Caption className="text-content-secondary-light dark:text-content-secondary-dark">
                {__("Récapitulatif de votre séance")}
            </Caption>

            <View pointerEvents={dragScope.scope === "group" ? "none" : "auto"}>
                <DraggableGrid
                    data={items}
                    numColumns={1}
                    enableJiggle={false}
                    enableGrouping={true}
                    onGroupCreate={onGroupCreate}
                    onDragStart={onRootDragStart}
                    onDragRelease={onRootDragRelease}
                    renderItem={(item: WorkoutBuilderItem) => renderRootItem(item)}
                />
            </View>
        </Animated.ScrollView>
    );
};

export default WorkoutBuilderPanel;

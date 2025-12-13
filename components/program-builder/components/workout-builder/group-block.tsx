import { DraggableGrid } from "@/components/modules/draggable-grid";
import type { WorkoutBuilderItem } from "@/components/program-builder/types";
import React, { useCallback, useMemo } from "react";
import { Text, View } from "react-native";

type Props = {
    group: WorkoutBuilderItem;
    dragScope: { scope: "root" } | { scope: "group"; groupKey: string };
    onGroupDragStart: (groupKey: string) => void;
    onGroupDragRelease: () => void;
    setGroupChildren: (groupKey: WorkoutBuilderItem["key"], children: WorkoutBuilderItem[]) => void;
    onChildDragOutside: (groupKey: WorkoutBuilderItem["key"], child: WorkoutBuilderItem) => void;
    renderChild?: (item: WorkoutBuilderItem, index: number) => React.ReactElement;
};

export function GroupBlock({
    group,
    dragScope,
    onGroupDragStart,
    onGroupDragRelease,
    setGroupChildren,
    onChildDragOutside,
    renderChild,
}: Props) {
    const groupKey = String(group.key);
    const children = useMemo(() => group.children ?? [], [group.children]);

    const rootShouldIgnore = dragScope.scope === "group" && dragScope.groupKey !== groupKey;

    const handleDragStart = useCallback(
        () => {
            onGroupDragStart(groupKey);
        },
        [groupKey, onGroupDragStart]
    );

    const handleDragRelease = useCallback(
        (data: WorkoutBuilderItem[]) => {
            setGroupChildren(group.key, data);
            onGroupDragRelease();
        },
        [group.key, onGroupDragRelease, setGroupChildren]
    );

    const handleDragOutside = useCallback(
        (item: WorkoutBuilderItem) => {
            onChildDragOutside(group.key, item);
            onGroupDragRelease();
        },
        [group.key, onChildDragOutside, onGroupDragRelease]
    );

    const renderChildItem = useCallback(
        (item: WorkoutBuilderItem, idx: number) => {
            if (renderChild) return renderChild(item, idx);

            return (
                <View
                    style={{
                        marginTop: 8,
                        borderRadius: 10,
                        paddingVertical: 12,
                        paddingHorizontal: 10,
                        backgroundColor: item.backgroundColor,
                    }}
                >
                    <Text style={{ color: "black", fontSize: 13 }}>{item.name}</Text>
                </View>
            );
        },
        [renderChild]
    );

    return (
        <View
            style={{
                paddingVertical: 16,
                paddingHorizontal: 12,
                backgroundColor: "#111827",
                borderWidth: 2,
                borderColor: "#60A5FA",
                borderRadius: 12,
                marginVertical: 8,
                opacity: rootShouldIgnore ? 0.35 : 1,
                overflow: "visible",
            }}
            pointerEvents={rootShouldIgnore ? "none" : "auto"}
        >
            <Text style={{ color: "white", fontSize: 14, fontWeight: "700" }}>{group.name}</Text>

            <View style={{ marginTop: 10, overflow: "visible" }}>
                <DraggableGrid
                    data={children}
                    numColumns={1}
                    enableJiggle={false}
                    enableGrouping={false}
                    outsideBoundsTopOffset={50}
                    onDragStart={handleDragStart}
                    onDragRelease={handleDragRelease}
                    onDragOutside={handleDragOutside}
                    renderItem={renderChildItem}
                />
            </View>
        </View>
    );
}
import type { DraggableGridProps } from "@/components/modules/draggable-grid/types";
import type { WorkoutBuilderItem } from "@/components/program-builder/types";
import { useCallback, useMemo, useState } from "react";

type DragScope =
    | { scope: "root" }
    | { scope: "group"; groupKey: string };

type UseNestedGroupingReturn = {
    dragScope: DragScope;
    onRootDragStart: NonNullable<DraggableGridProps<WorkoutBuilderItem>["onDragStart"]>;
    onRootDragRelease: NonNullable<DraggableGridProps<WorkoutBuilderItem>["onDragRelease"]>;
    onGroupDragStart: (groupKey: string) => void;
    onGroupDragRelease: () => void;
    onGroupCreate: NonNullable<DraggableGridProps<WorkoutBuilderItem>["onGroupCreate"]>;
    setGroupChildren: (groupKey: string, children: WorkoutBuilderItem[]) => void;
};

const makeGroupKey = () =>
    `group-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export function useNestedGrouping(
    items: WorkoutBuilderItem[],
    setItems: React.Dispatch<React.SetStateAction<WorkoutBuilderItem[]>>
): UseNestedGroupingReturn {
    const [dragScope, setDragScope] = useState<DragScope>({ scope: "root" });

    const setGroupChildren = useCallback(
        (groupKey: string, children: WorkoutBuilderItem[]) => {
            setItems((prev) =>
                prev.map((it) => {
                    if (String(it.key) !== String(groupKey)) return it;
                    return { ...it, children };
                })
            );
        },
        [setItems]
    );

    const onRootDragStart = useCallback<NonNullable<DraggableGridProps<WorkoutBuilderItem>["onDragStart"]>>(
        () => {
            setDragScope({ scope: "root" });
        },
        []
    );

    const onRootDragRelease = useCallback<NonNullable<DraggableGridProps<WorkoutBuilderItem>["onDragRelease"]>>(
        () => {
            setDragScope({ scope: "root" });
        },
        []
    );

    const onGroupDragStart = useCallback((groupKey: string) => {
        setDragScope({ scope: "group", groupKey });
    }, []);

    const onGroupDragRelease = useCallback(() => {
        setDragScope({ scope: "root" });
    }, []);

    const onGroupCreate = useCallback<NonNullable<DraggableGridProps<WorkoutBuilderItem>["onGroupCreate"]>>(
        (sourceItems, targetItem) => {
            setItems((prev) => {
                const targetKey = String(targetItem.key);
                const dragged = sourceItems.find((it) => String(it.key) !== targetKey);
                if (!dragged) return prev;

                const draggedKey = String(dragged.key);
                if (draggedKey === targetKey) return prev;

                const targetIndex = prev.findIndex((e) => String(e.key) === targetKey);
                const draggedIndex = prev.findIndex((e) => String(e.key) === draggedKey);
                if (targetIndex === -1 || draggedIndex === -1) return prev;

                const actualTarget = prev[targetIndex];

                if (actualTarget.isGroup) {
                    const next = prev
                        .filter((e) => String(e.key) !== draggedKey)
                        .map((e) => {
                            if (String(e.key) !== targetKey) return e;
                            return {
                                ...e,
                                children: [...(e.children ?? []), dragged],
                            };
                        });

                    return next;
                }

                const group: WorkoutBuilderItem = {
                    key: makeGroupKey(),
                    name: "Groupe",
                    backgroundColor: "#111827",
                    isGroup: true,
                    children: [actualTarget, dragged],
                };

                const desiredIndex = Math.min(targetIndex, draggedIndex);
                const next = prev.filter(
                    (e) => String(e.key) !== targetKey && String(e.key) !== draggedKey
                );

                next.splice(desiredIndex, 0, group);

                return next;
            });
        },
        [setItems]
    );

    return useMemo(
        () => ({
            dragScope,
            onRootDragStart,
            onRootDragRelease,
            onGroupDragStart,
            onGroupDragRelease,
            onGroupCreate,
            setGroupChildren,
        }),
        [
            dragScope,
            onRootDragStart,
            onRootDragRelease,
            onGroupDragStart,
            onGroupDragRelease,
            onGroupCreate,
            setGroupChildren,
        ]
    );
}

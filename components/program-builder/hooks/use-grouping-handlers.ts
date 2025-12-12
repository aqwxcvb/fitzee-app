import { DraggableGridProps } from "@/components/modules/draggable-grid";
import { useCallback } from "react";
import { WorkoutBuilderItem } from "../types";

type UseGroupingHandlersOptions = {
    setItems: React.Dispatch<React.SetStateAction<WorkoutBuilderItem[]>>;
};

type UseGroupingHandlersReturn = {
    onGroupCreate: NonNullable<DraggableGridProps<WorkoutBuilderItem>["onGroupCreate"]>;
    onChildDragOutside: (groupKey: WorkoutBuilderItem["key"], child: WorkoutBuilderItem) => void;
};

type Location =
    | { kind: "root"; index: number }
    | { kind: "child"; groupIndex: number; childIndex: number };

function isSameKey(a: WorkoutBuilderItem["key"], b: WorkoutBuilderItem["key"]) {
    return String(a) === String(b);
}

function findLocation(items: WorkoutBuilderItem[], key: WorkoutBuilderItem["key"]): Location | null {
    const k = String(key);

    for (let i = 0; i < items.length; i += 1) {
        const it = items[i];
        if (String(it.key) === k) return { kind: "root", index: i };

        if (it.isGroup && Array.isArray(it.children)) {
            for (let j = 0; j < it.children.length; j += 1) {
                if (String(it.children[j].key) === k) {
                    return { kind: "child", groupIndex: i, childIndex: j };
                }
            }
        }
    }

    return null;
}

function removeItemFromAnywhere(
    items: WorkoutBuilderItem[],
    key: WorkoutBuilderItem["key"]
): { next: WorkoutBuilderItem[]; removed?: WorkoutBuilderItem } {
    const loc = findLocation(items, key);
    if (!loc) return { next: items };

    if (loc.kind === "root") {
        const removed = items[loc.index];
        const next = items.filter((_, idx) => idx !== loc.index);
        return { next, removed };
    }

    const group = items[loc.groupIndex];
    if (!group.isGroup) return { next: items };

    const children = group.children ?? [];
    const removed = children[loc.childIndex];

    const nextChildren = children.filter((_, idx) => idx !== loc.childIndex);
    const next = [...items];

    if (nextChildren.length <= 1) {
        const replacement = nextChildren[0];

        if (replacement) {
            next.splice(loc.groupIndex, 1, replacement);
        } else {
            next.splice(loc.groupIndex, 1);
        }

        return { next, removed };
    }

    next[loc.groupIndex] = { ...group, children: nextChildren };
    return { next, removed };
}

function insertAfterIndex(items: WorkoutBuilderItem[], index: number, item: WorkoutBuilderItem) {
    const next = [...items];
    next.splice(index + 1, 0, item);
    return next;
}

export function useGroupingHandlers({ setItems }: UseGroupingHandlersOptions): UseGroupingHandlersReturn {
    const onGroupCreate = useCallback<NonNullable<DraggableGridProps<WorkoutBuilderItem>["onGroupCreate"]>>(
        (sourceItems, targetItem) => {
            setItems((prev) => {
                const targetKey = targetItem.key;
                const draggedItem = sourceItems.find((it) => !isSameKey(it.key, targetKey));
                if (!draggedItem) return prev;

                const draggedKey = draggedItem.key;
                if (isSameKey(draggedKey, targetKey)) return prev;

                const removedDragged = removeItemFromAnywhere(prev, draggedKey);
                if (!removedDragged.removed) return prev;

                const withoutDragged = removedDragged.next;

                const targetLoc = findLocation(withoutDragged, targetKey);
                if (!targetLoc) return prev;

                if (targetLoc.kind !== "root") return prev;

                const actualTarget = withoutDragged[targetLoc.index];

                if (actualTarget.isGroup) {
                    const children = actualTarget.children ?? [];
                    const nextGroup: WorkoutBuilderItem = {
                        ...actualTarget,
                        children: [...children, removedDragged.removed],
                    };

                    const next = [...withoutDragged];
                    next[targetLoc.index] = nextGroup;
                    return next;
                }

                const removedTarget = removeItemFromAnywhere(withoutDragged, targetKey);
                if (!removedTarget.removed) return prev;

                const desiredIndex = targetLoc.index;
                const base = removedTarget.next;

                const group: WorkoutBuilderItem = {
                    key: `group-${Date.now()}-${Math.random().toString(16).slice(2)}`,
                    name: "Superset",
                    backgroundColor: `#${Math.floor(Math.random() * 16777215)
                        .toString(16)
                        .padStart(6, "0")}`,
                    isGroup: true,
                    children: [removedTarget.removed, removedDragged.removed],
                };

                const next = [...base];

                const removedBefore = (removedTarget.next.length < withoutDragged.length ? 1 : 0);
                const insertIndex = Math.max(0, desiredIndex - removedBefore);

                next.splice(insertIndex, 0, group);
                return next;
            });
        },
        [setItems]
    );

    const onChildDragOutside = useCallback(
        (groupKey: WorkoutBuilderItem["key"], child: WorkoutBuilderItem) => {
            setItems((prev) => {
                const groupIndex = prev.findIndex((it) => isSameKey(it.key, groupKey));
                if (groupIndex === -1) return prev;

                const group = prev[groupIndex];
                if (!group.isGroup) return prev;

                const removed = removeItemFromAnywhere(prev, child.key);
                if (!removed.removed) return prev;

                const afterRemovalLoc = findLocation(removed.next, groupKey);

                if (afterRemovalLoc && afterRemovalLoc.kind === "root") {
                    return insertAfterIndex(removed.next, afterRemovalLoc.index, removed.removed);
                }

                const safeIndex = Math.min(groupIndex, removed.next.length - 1);
                return insertAfterIndex(removed.next, Math.max(0, safeIndex), removed.removed);
            });
        },
        [setItems]
    );

    return {
        onGroupCreate,
        onChildDragOutside,
    };
}

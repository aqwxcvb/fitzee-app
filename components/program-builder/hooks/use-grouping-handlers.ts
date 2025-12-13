import type { DraggableGridProps } from "@/components/modules/draggable-grid/types";
import { useCallback } from "react";
import type { WorkoutBuilderItem } from "../types";

type Props = {
    setItems: React.Dispatch<React.SetStateAction<WorkoutBuilderItem[]>>;
};

function findItem(items: WorkoutBuilderItem[], key: string) {
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        if (String(item.key) === key) {
            return { item, rootIndex: i, childIndex: -1 };
        }
        
        if (item.isGroup && item.children) {
            const childIdx = item.children.findIndex(c => String(c.key) === key);
            if (childIdx !== -1) {
                return { item: item.children[childIdx], rootIndex: i, childIndex: childIdx };
            }
        }
    }
    
    return null;
}

function removeItem(items: WorkoutBuilderItem[], key: string): WorkoutBuilderItem[] {
    const found = findItem(items, key);
    
    if (!found) {
        return items;
    }

    if (found.childIndex === -1) {
        return items.filter((_, i) => i !== found.rootIndex);
    }

    const group = items[found.rootIndex];
    const newChildren = group.children!.filter((_, i) => i !== found.childIndex);

    if (newChildren.length <= 1) {
        return items
            .map((item, i) => i === found.rootIndex ? (newChildren[0] ?? null) : item)
            .filter(Boolean) as WorkoutBuilderItem[];
    }

    return items.map((item, i) =>
        i === found.rootIndex ? { ...item, children: newChildren } : item
    );
}

function createGroup(children: WorkoutBuilderItem[]): WorkoutBuilderItem {
    return {
        key: `group-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        name: "Superset",
        backgroundColor: "#111827",
        isGroup: true,
        children,
    };
}

export function useGroupingHandlers({ setItems }: Props) {
    const onGroupCreate = useCallback<NonNullable<DraggableGridProps<WorkoutBuilderItem>["onGroupCreate"]>>(
        (sourceItems, targetItem) => {
            setItems(prev => {
                const targetKey = String(targetItem.key);
                const draggedItem = sourceItems.find(it => String(it.key) !== targetKey);
                
                if (!draggedItem) {
                    return prev;
                }

                const draggedKey = String(draggedItem.key);
                const targetIndex = prev.findIndex(e => String(e.key) === targetKey);
                const draggedIndex = prev.findIndex(e => String(e.key) === draggedKey);
                
                if (targetIndex === -1 || draggedIndex === -1) {
                    return prev;
                }

                const target = prev[targetIndex];

                if (target.isGroup) {
                    return prev
                        .filter(e => String(e.key) !== draggedKey)
                        .map(e => {
                            if (String(e.key) !== targetKey) {
                                return e;
                            }
                            return { ...e, children: [...(e.children ?? []), draggedItem] };
                        });
                }

                const group = createGroup([target, draggedItem]);
                const insertIndex = Math.min(targetIndex, draggedIndex);
                const next = prev.filter(e => String(e.key) !== targetKey && String(e.key) !== draggedKey);
                
                next.splice(insertIndex, 0, group);
                
                return next;
            });
        },
        [setItems]
    );

    const onChildDragOutside = useCallback(
        (groupKey: WorkoutBuilderItem["key"], child: WorkoutBuilderItem) => {
            setItems(prev => {
                const groupIndex = prev.findIndex(it => String(it.key) === String(groupKey));
                
                if (groupIndex === -1 || !prev[groupIndex].isGroup) {
                    return prev;
                }

                const next = removeItem(prev, String(child.key));
                const insertIdx = Math.min(groupIndex + 1, next.length);
                
                next.splice(insertIdx, 0, child);
                
                return next;
            });
        },
        [setItems]
    );

    const setGroupChildren = useCallback(
        (groupKey: WorkoutBuilderItem["key"], children: WorkoutBuilderItem[]) => {
            setItems(prev =>
                prev.map(item => {
                    if (String(item.key) !== String(groupKey)) {
                        return item;
                    }
                    return { ...item, children };
                })
            );
        },
        [setItems]
    );

    return { onGroupCreate, onChildDragOutside, setGroupChildren };
}
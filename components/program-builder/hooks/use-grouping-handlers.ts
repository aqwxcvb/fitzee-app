import { DraggableGridProps } from "@/components/modules/draggable-grid";
import { useCallback } from "react";
import { WorkoutBuilderItem } from "../types";

type Props = {
    setItems: React.Dispatch<React.SetStateAction<WorkoutBuilderItem[]>>;
};

// Trouve un item par sa clé (à la racine ou dans un groupe)
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

// Supprime un item et gère la dissolution des groupes à 1 élément
function removeItem(items: WorkoutBuilderItem[], key: string): WorkoutBuilderItem[] {
    const found = findItem(items, key);
    if (!found) return items;

    // Item à la racine
    if (found.childIndex === -1) {
        return items.filter((_, i) => i !== found.rootIndex);
    }

    // Item dans un groupe
    const group = items[found.rootIndex];
    const newChildren = group.children!.filter((_, i) => i !== found.childIndex);

    // Groupe dissous si ≤ 1 enfant
    if (newChildren.length <= 1) {
        return items.map((item, i) => 
            i === found.rootIndex ? (newChildren[0] ?? null) : item
        ).filter(Boolean) as WorkoutBuilderItem[];
    }

    return items.map((item, i) => 
        i === found.rootIndex ? { ...item, children: newChildren } : item
    );
}

// Crée un nouveau groupe
function createGroup(children: WorkoutBuilderItem[]): WorkoutBuilderItem {
    return {
        key: String(Date.now()),
        name: "Superset",
        backgroundColor: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`,
        isGroup: true,
        children,
    };
}

export function useGroupingHandlers({ setItems }: Props) {
    // Quand on drop un item sur un autre pour créer/rejoindre un groupe
    const onGroupCreate = useCallback<NonNullable<DraggableGridProps<WorkoutBuilderItem>["onGroupCreate"]>>(
        (sourceItems, targetItem) => {
            setItems(prev => {
                const draggedItem = sourceItems.find(it => String(it.key) !== String(targetItem.key));
                if (!draggedItem) return prev;

                const targetFound = findItem(prev, String(targetItem.key));
                if (!targetFound || targetFound.childIndex !== -1) return prev;

                // Retirer l'item glissé
                let next = removeItem(prev, String(draggedItem.key));
                const draggedData = findItem(prev, String(draggedItem.key))?.item ?? draggedItem;

                // Recalculer la position de la cible après suppression
                const newTargetFound = findItem(next, String(targetItem.key));
                if (!newTargetFound) return prev;

                const target = next[newTargetFound.rootIndex];

                // Si la cible est déjà un groupe, ajouter l'item
                if (target.isGroup) {
                    next[newTargetFound.rootIndex] = {
                        ...target,
                        children: [...(target.children ?? []), draggedData],
                    };
                    return next;
                }

                // Sinon, créer un nouveau groupe
                next = removeItem(next, String(targetItem.key));
                const group = createGroup([target, draggedData]);
                next.splice(Math.min(newTargetFound.rootIndex, next.length), 0, group);

                return next;
            });
        },
        [setItems]
    );

    // Quand on sort un item d'un groupe
    const onChildDragOutside = useCallback(
        (groupKey: WorkoutBuilderItem["key"], child: WorkoutBuilderItem) => {
            setItems(prev => {
                const groupIndex = prev.findIndex(it => String(it.key) === String(groupKey));
                if (groupIndex === -1 || !prev[groupIndex].isGroup) return prev;

                const next = removeItem(prev, String(child.key));
                const insertIdx = Math.min(groupIndex + 1, next.length);
                
                next.splice(insertIdx, 0, child);
                return next;
            });
        },
        [setItems]
    );

    return { onGroupCreate, onChildDragOutside };
}
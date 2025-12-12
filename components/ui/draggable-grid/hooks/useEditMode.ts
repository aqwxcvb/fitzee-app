import { useCallback, useState } from 'react';

export const useEditMode = (onEditModeChange?: (isEditMode: boolean) => void) => {
    const [isEditMode, setIsEditMode] = useState(false);
    const [activeItemKey, setActiveItemKey] = useState<string | undefined>();

    const enterEditMode = useCallback((itemKey: string) => {
        if (!isEditMode) {
            setIsEditMode(true);
            onEditModeChange?.(true);
        }
        setActiveItemKey(itemKey);
    }, [isEditMode, onEditModeChange]);

    const exitEditMode = useCallback(() => {
        setIsEditMode(false);
        setActiveItemKey(undefined);
        onEditModeChange?.(false);
    }, [onEditModeChange]);

    return {
        isEditMode,
        activeItemKey,
        enterEditMode,
        exitEditMode,
    };
};

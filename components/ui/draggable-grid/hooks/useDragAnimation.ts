import { useCallback, useRef } from 'react';
import { Animated } from 'react-native';
import { REORDER_ANIMATION_DURATION } from '../utils/constants';

export const useDragAnimation = <T extends { key: string | number }>() => {
    const itemAnims = useRef(new Map<string, Animated.ValueXY>());
    const activeItemKeyRef = useRef<string | undefined>();
    const isDraggingRef = useRef(false);

    const getOrCreateAnim = useCallback((key: string, initialPos: { x: number; y: number }) => {
        let anim = itemAnims.current.get(key);
        if (!anim) {
            anim = new Animated.ValueXY(initialPos);
            itemAnims.current.set(key, anim);
        }
        return anim;
    }, []);

    const setActiveItem = useCallback((key: string | undefined) => {
        activeItemKeyRef.current = key;
    }, []);

    const startDrag = useCallback((key: string, position: { x: number; y: number }) => {
        isDraggingRef.current = true;
        activeItemKeyRef.current = key;
        
        const anim = itemAnims.current.get(key);
        if (anim) {
            anim.setOffset({ x: position.x, y: position.y });
            anim.setValue({ x: 0, y: 0 });
        }
    }, []);

    const updateDrag = useCallback((key: string, dx: number, dy: number) => {
        const anim = itemAnims.current.get(key);
        if (anim) {
            anim.setValue({ x: dx, y: dy });
        }
    }, []);

    const getCurrentPosition = useCallback((key: string): { x: number; y: number } => {
        const anim = itemAnims.current.get(key);
        if (!anim) return { x: 0, y: 0 };
        
        const x = (anim.x as any)._value + (anim.x as any)._offset;
        const y = (anim.y as any)._value + (anim.y as any)._offset;
        return { x, y };
    }, []);

    const animateToPosition = useCallback((
        key: string,
        position: { x: number; y: number },
        onComplete?: () => void
    ) => {
        const anim = itemAnims.current.get(key);
        if (anim) {
            Animated.timing(anim, {
                toValue: position,
                duration: REORDER_ANIMATION_DURATION,
                useNativeDriver: false,
            }).start(onComplete);
        }
    }, []);

    const endDrag = useCallback((key: string, finalPosition: { x: number; y: number }, onComplete?: () => void) => {
        const anim = itemAnims.current.get(key);
        if (anim) {
            anim.flattenOffset();
            Animated.timing(anim, {
                toValue: finalPosition,
                duration: REORDER_ANIMATION_DURATION,
                useNativeDriver: false,
            }).start(() => {
                isDraggingRef.current = false;
                activeItemKeyRef.current = undefined;
                onComplete?.();
            });
        } else {
            isDraggingRef.current = false;
            activeItemKeyRef.current = undefined;
            onComplete?.();
        }
    }, []);

    const resetPosition = useCallback((key: string, position: { x: number; y: number }) => {
        const anim = itemAnims.current.get(key);
        if (anim) {
            anim.setValue(position);
        }
    }, []);

    const cleanup = useCallback((keys: string[]) => {
        const keysSet = new Set(keys);
        for (const key of Array.from(itemAnims.current.keys())) {
            if (!keysSet.has(key)) {
                itemAnims.current.delete(key);
            }
        }
    }, []);

    return {
        itemAnims: itemAnims.current,
        activeItemKey: activeItemKeyRef.current,
        isDragging: isDraggingRef.current,
        getOrCreateAnim,
        setActiveItem,
        startDrag,
        updateDrag,
        getCurrentPosition,
        animateToPosition,
        endDrag,
        resetPosition,
        cleanup,
    };
};

import React, { createContext, useCallback, useContext, useRef } from "react";
import { Dimensions, NativeScrollEvent, NativeSyntheticEvent, PanResponderGestureState, ScrollView } from "react-native";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const AUTO_SCROLL_EDGE_THRESHOLD = 80;
const AUTO_SCROLL_SPEED = 12;

interface AutoScrollContextValue {
    /** Callback à passer au ScrollView pour suivre l'offset */
    handleScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
    /** Callback à passer au composant draggable pour gérer le mouvement */
    handleDragMove: (gestureState: PanResponderGestureState) => void;
    /** Callback à appeler à la fin du drag */
    handleDragEnd: () => void;
    /** Enregistre la ref du ScrollView */
    registerScrollView: (ref: ScrollView | null) => void;
    /** Enregistre la fonction de compensation de scroll */
    registerScrollOffsetHandler: (handler: ((deltaY: number) => void) | null) => void;
    /** Met à jour la hauteur du contenu */
    setContentHeight: (height: number) => void;
    /** Met à jour la hauteur du container */
    setContainerHeight: (height: number) => void;
}

const AutoScrollContext = createContext<AutoScrollContextValue | null>(null);

interface AutoScrollProviderProps {
    children: React.ReactNode;
    /** Seuil de distance du bord pour déclencher l'auto-scroll (défaut: 80) */
    edgeThreshold?: number;
    /** Vitesse de scroll en pixels par frame (défaut: 12) */
    scrollSpeed?: number;
}

export function AutoScrollProvider({ 
    children, 
    edgeThreshold = AUTO_SCROLL_EDGE_THRESHOLD,
    scrollSpeed = AUTO_SCROLL_SPEED,
}: AutoScrollProviderProps) {
    const scrollViewRef = useRef<ScrollView | null>(null);
    const scrollOffsetHandlerRef = useRef<((deltaY: number) => void) | null>(null);
    const scrollOffsetRef = useRef(0);
    const autoScrollFrame = useRef<number | null>(null);
    const autoScrollDirection = useRef<-1 | 0 | 1>(0);
    const contentHeightRef = useRef(0);
    const containerHeightRef = useRef(0);

    const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
    }, []);

    const stopAutoScroll = useCallback(() => {
        autoScrollDirection.current = 0;
        if (autoScrollFrame.current !== null) {
            cancelAnimationFrame(autoScrollFrame.current);
            autoScrollFrame.current = null;
        }
    }, []);

    const runAutoScroll = useCallback(() => {
        if (!scrollViewRef.current) {
            autoScrollFrame.current = null;
            return;
        }
        if (autoScrollDirection.current === 0) {
            autoScrollFrame.current = null;
            return;
        }

        const maxOffset = Math.max(0, contentHeightRef.current - containerHeightRef.current);
        const currentOffset = scrollOffsetRef.current;
        const direction = autoScrollDirection.current;
        const targetOffset = Math.max(
            0,
            Math.min(maxOffset, currentOffset + direction * scrollSpeed)
        );
        const delta = targetOffset - currentOffset;

        if (delta === 0) {
            autoScrollDirection.current = 0;
            autoScrollFrame.current = null;
            return;
        }

        scrollOffsetRef.current = targetOffset;
        scrollViewRef.current.scrollTo({ y: targetOffset, animated: false });
        scrollOffsetHandlerRef.current?.(delta);

        autoScrollFrame.current = requestAnimationFrame(runAutoScroll);
    }, [scrollSpeed]);

    const startAutoScroll = useCallback((direction: -1 | 1) => {
        if (autoScrollDirection.current === direction && autoScrollFrame.current !== null) {
            return;
        }

        autoScrollDirection.current = direction;
        if (autoScrollFrame.current === null) {
            autoScrollFrame.current = requestAnimationFrame(runAutoScroll);
        }
    }, [runAutoScroll]);

    const handleDragMove = useCallback((gestureState: PanResponderGestureState) => {
        const moveY = gestureState.moveY;
        if (moveY === undefined) return;

        if (moveY <= edgeThreshold) {
            startAutoScroll(-1);
        } else if (SCREEN_HEIGHT - moveY <= edgeThreshold) {
            startAutoScroll(1);
        } else {
            stopAutoScroll();
        }
    }, [edgeThreshold, startAutoScroll, stopAutoScroll]);

    const handleDragEnd = useCallback(() => {
        stopAutoScroll();
    }, [stopAutoScroll]);

    const registerScrollView = useCallback((ref: ScrollView | null) => {
        scrollViewRef.current = ref;
    }, []);

    const registerScrollOffsetHandler = useCallback((handler: ((deltaY: number) => void) | null) => {
        scrollOffsetHandlerRef.current = handler;
    }, []);

    const setContentHeight = useCallback((height: number) => {
        contentHeightRef.current = height;
    }, []);

    const setContainerHeight = useCallback((height: number) => {
        containerHeightRef.current = height;
    }, []);

    const value: AutoScrollContextValue = {
        handleScroll,
        handleDragMove,
        handleDragEnd,
        registerScrollView,
        registerScrollOffsetHandler,
        setContentHeight,
        setContainerHeight,
    };

    return (
        <AutoScrollContext.Provider value={value}>
            {children}
        </AutoScrollContext.Provider>
    );
}

export function useAutoScroll() {
    const context = useContext(AutoScrollContext);
    if (!context) {
        throw new Error("useAutoScroll must be used within an AutoScrollProvider");
    }
    return context;
}


import GorhomBottomSheet, {
    BottomSheetBackdrop,
    BottomSheetView,
    BottomSheetModal as GorhomBottomSheetModal,
} from "@gorhom/bottom-sheet";
import { BottomSheetDefaultBackdropProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types";
import {
    Children,
    cloneElement,
    forwardRef,
    isValidElement,
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
} from "react";
import { useColorScheme } from "react-native";

interface BottomSheetModalProps {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    snapPoints?: (string | number)[];
    enableDrag?: boolean;
}

export interface BottomSheetModalRef {
    present: () => void;
    dismiss: () => void;
}

export function BottomSheetModal({
    visible,
    onClose,
    children,
    snapPoints,
    enableDrag = true,
}: BottomSheetModalProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const bottomSheetRef = useRef<GorhomBottomSheetModal>(null);

    useEffect(() => {
        if (visible) {
            bottomSheetRef.current?.present();
        } else {
            bottomSheetRef.current?.dismiss();
        }
    }, [visible]);

    const handleSheetChanges = useCallback(
        (index: number) => {
            if (index === -1) {
                onClose();
            }
        },
        [onClose],
    );

    const closeWithAnimation = useCallback(() => {
        bottomSheetRef.current?.dismiss();
    }, []);

    const renderBackdrop = useCallback(
        (props: BottomSheetDefaultBackdropProps) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                opacity={0.6}
            />
        ),
        [],
    );

    const handleIndicatorStyle = {
        backgroundColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
        width: 36,
        height: 5,
    };

    const backgroundStyle = {
        backgroundColor: isDark ? "#1c1c1e" : "#f2f2f7",
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
    };

    return (
        <GorhomBottomSheetModal
            ref={bottomSheetRef}
            onChange={handleSheetChanges}
            enableDynamicSizing={!snapPoints}
            snapPoints={snapPoints}
            enablePanDownToClose={enableDrag}
            backdropComponent={renderBackdrop}
            handleIndicatorStyle={handleIndicatorStyle}
            backgroundStyle={backgroundStyle}
            enableContentPanningGesture={enableDrag}
        >
            <BottomSheetView className="pb-8">
                {Children.map(children, (child) =>
                    isValidElement(child)
                        ? cloneElement(child, { closeWithAnimation } as any)
                        : child,
                )}
            </BottomSheetView>
        </GorhomBottomSheetModal>
    );
}

// Composant BottomSheet standard (non-modal) pour d'autres usages
interface BottomSheetProps {
    children: React.ReactNode;
    snapPoints?: (string | number)[];
    initialIndex?: number;
    onChange?: (index: number) => void;
    enableDrag?: boolean;
}

export const BottomSheet = forwardRef<GorhomBottomSheet, BottomSheetProps>(
    ({ children, snapPoints = ["25%", "50%"], initialIndex = -1, onChange, enableDrag = true }, ref) => {
        const colorScheme = useColorScheme();
        const isDark = colorScheme === "dark";
        const bottomSheetRef = useRef<GorhomBottomSheet>(null);

        useImperativeHandle(ref, () => bottomSheetRef.current!);

        const handleIndicatorStyle = {
            backgroundColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
            width: 36,
            height: 5,
        };

        const backgroundStyle = {
            backgroundColor: isDark ? "#1c1c1e" : "#f2f2f7",
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
        };

        return (
            <GorhomBottomSheet
                ref={bottomSheetRef}
                snapPoints={snapPoints}
                index={initialIndex}
                onChange={onChange}
                enablePanDownToClose={enableDrag}
                handleIndicatorStyle={handleIndicatorStyle}
                backgroundStyle={backgroundStyle}
            >
                <BottomSheetView className="flex-1">
                    {children}
                </BottomSheetView>
            </GorhomBottomSheet>
        );
    },
);

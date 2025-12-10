import { LayoutChangeEvent } from "react-native";

export type PopupOption = {
    label: string;
    icon: string;
    onPress: () => void;
};

export type PopupTriggerPosition = {
    x: number;
    y: number;
    width: number;
    height: number;
};

export type PopupProps = {
    isOpen: boolean;
    onClose: () => void;
    options: PopupOption[];
    triggerPosition?: PopupTriggerPosition;
    offset?: number;
    width?: number;
    showOverlay?: boolean;
};

export type PopupWrapperProps = {
    children: React.ReactElement<{ onLayout?: (event: LayoutChangeEvent) => void; ref?: React.Ref<any> }>;
    isOpen: boolean;
    onClose: () => void;
    options: PopupOption[];
    offset?: number;
    width?: number;
    showOverlay?: boolean;
}
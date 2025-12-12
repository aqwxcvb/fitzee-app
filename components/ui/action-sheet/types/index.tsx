export type Anchor = {
    x: number;
    y: number;
    width: number;
    height: number;
}

export type ActionSheetPlacement = "top" | "bottom" | "left" | "right" | "auto";

export type ActionSheetProps = {
    children: React.ReactElement;
    options?: ActionSheetOption[];
    offset?: number;
    placement?: ActionSheetPlacement;
}

export type ActionSheetOption = {
    category?: string;
    label: string;
    icon?: React.ReactNode;
    onPress: () => void;
}

export type ActionSheet = {
    height: number;
    width: number;
}
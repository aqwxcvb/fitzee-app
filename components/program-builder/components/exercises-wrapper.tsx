import { GridIcon, ListIcon } from "@/components/ui/icons";
import { Caption } from "@/components/ui/typography";
import { useTranslation } from "@/i18n";
import React, { ReactElement, ReactNode, useCallback, useMemo, useState } from "react";
import { TouchableOpacity, View } from "react-native";

type DisplayMode = "grid" | "list";

export default function ExercisesWrapper({ children }: { children: ReactNode }) {
    const { __ } = useTranslation();
    const [displayMode, setDisplayMode] = useState<DisplayMode>("grid");
    const isGrid = displayMode === "grid";

    const toggleDisplayMode = useCallback(() => setDisplayMode(mode => (mode === "grid" ? "list" : "grid")), []);

    const displayModeIcon = useMemo(() => {
        const iconClassName = "text-content-secondary-light dark:text-content-secondary-dark";
        
        return isGrid ? <GridIcon size={18} className={iconClassName} /> : <ListIcon size={18} strokeWidth={2} className={iconClassName} />;
    }, [isGrid]);

    const childrenWithDisplayMode = useMemo(() => {
        if (!children) return null;

        return React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
                return React.cloneElement(child as ReactElement<{ displayMode: DisplayMode }>, { 
                    displayMode 
                });
            }
            return child;
        });
    }, [children, displayMode]);

    return (
        <View className="flex-1">
            <View className="flex-row items-center justify-between">
                <Caption className="my-4 text-content-secondary-light dark:text-content-secondary-dark">
                    {__("Tous les exercices")}
                </Caption>

                <TouchableOpacity onPress={toggleDisplayMode}>
                    {displayModeIcon}
                </TouchableOpacity>
            </View>
            
            <View className={`flex-1 ${isGrid ? "flex-row flex-wrap gap-[2%]" : "flex-col gap-2"}`}>
                {childrenWithDisplayMode}
            </View>
        </View>
    );
}
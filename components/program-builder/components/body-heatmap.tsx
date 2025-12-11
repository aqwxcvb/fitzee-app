import React, { useMemo } from "react";
import { useColorScheme, View } from "react-native";
import Body, { ExtendedBodyPart } from "react-native-body-highlighter";
import { Muscle } from "../types/exercise";

const BodyHeatmap = ({ muscles }: { muscles: Muscle[] }) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";

    const { strokeColor, fillColor, colors } = useMemo(() => {
        return isDark
            ? {
                strokeColor: "#555962",
                fillColor: "#2C2E34",
                colors: ["#0A84FF", "#96C4FF"],
            }
            : {
                strokeColor: "#B8BABF",
                fillColor: "#CBCED4",
                colors: ["#007AFF", "#96C4FF"],
            };
    }, [isDark]);

    const { data, perspective, area } = useMemo(() => {
        const primaryMuscle = muscles.find(muscle => muscle.type === "primary");

        const defaultValues = { perspective: "front", area: "upper" };
        const { perspective, area } = primaryMuscle ?? defaultValues;

        const data = muscles.map(muscle => {
            return {
                slug: muscle.name.toLowerCase() as string,
                intensity: muscle.type === "primary" ? 1 : 2,
            };
        });

        return { data, perspective, area };
    }, [muscles]);

    const positionClass = area === "upper" ? "-top-9" : "-bottom-6";


    return (
        <View className={`absolute ${positionClass}`}>
            <Body
                data={data as ExtendedBodyPart[]}
                side={perspective as "front" | "back"}
                scale={0.45}
                border={strokeColor}
                defaultFill={fillColor}
                colors={colors}
            />
        </View>
    );
};

export default BodyHeatmap;
import React from "react";
import { useColorScheme, View } from "react-native";
import Body from "react-native-body-highlighter";
import { Muscle } from "../types/exercise";

const BodyHeatmap = ({ muscles }: { muscles: Muscle[] }) => {
    const { perspective, area } = muscles.find(muscle => muscle.type === "primary") ?? { perspective: "front", area: "upper" };
    const isUpper = area === "upper";
    const data = muscles.map(muscle => {
        return {
            slug: muscle.name.toLowerCase() as any,
            intensity: muscle.type === "primary" ? 1 : 2,
        };
    });

    const isDark = useColorScheme() === "dark";
    const strokeColor = isDark ? "#555962" : "#B8BABF";
    const fillColor = isDark ? "#2C2E34" : "#CBCED4";
    const colors = isDark ? ["#0A84FF", "#96C4FF"] : ["#007AFF", "#96C4FF"];

    return (
        <View className={`absolute ${isUpper ? "-top-9" : "-bottom-6"}`}>
            <Body
                data={data}
                side={perspective}
                scale={0.45}
                border={strokeColor}
                defaultFill={fillColor}
                colors={colors}
            />
        </View>
    );
};

export default React.memo(BodyHeatmap);
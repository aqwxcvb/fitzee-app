import { cssInterop } from "nativewind";
import Svg, { G, Path } from "react-native-svg";
import { IconProps } from "./types";

function PlusFilledIcon({ size = 24, strokeWidth = 2, ...props }: IconProps) {
    return (
        <Svg viewBox="0 0 32 32" fill="currentColor" width={size} height={size} {...props}>
            <G id="SVGRepo_bgCarrier" stroke-width="0"></G>
            <G id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></G>
            <G id="SVGRepo_iconCarrier">
                <Path d="M15.5 29.5c-7.18 0-13-5.82-13-13s5.82-13 13-13 13 5.82 13 13-5.82 13-13 13zM21.938 15.938c0-0.552-0.448-1-1-1h-4v-4c0-0.552-0.447-1-1-1h-1c-0.553 0-1 0.448-1 1v4h-4c-0.553 0-1 0.448-1 1v1c0 0.553 0.447 1 1 1h4v4c0 0.553 0.447 1 1 1h1c0.553 0 1-0.447 1-1v-4h4c0.552 0 1-0.447 1-1v-1z"></Path>
            </G>
        </Svg>
    );
}

export default cssInterop(PlusFilledIcon, {
    className: {
        target: "style" as keyof IconProps,
    }
});
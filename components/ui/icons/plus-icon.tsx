import { cssInterop } from "nativewind";
import Svg, { Path } from "react-native-svg";
import { IconProps } from "./types";

function PlusIcon({ size = 24, strokeWidth = 2, ...props }: IconProps) {
    return (
        <Svg viewBox="0 0 24 24" fill="none" width={size} height={size} {...props}>
            <Path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

export default cssInterop(PlusIcon, {
    className: {
        target: "style" as keyof IconProps,
    }
});

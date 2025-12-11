import { cssInterop } from "nativewind";
import { Path, Svg } from "react-native-svg";
import { IconProps } from "./types";

const ListIcon = ({ size = 24, strokeWidth = 2, ...props }: IconProps) => (
    <Svg
        viewBox="0 0 24 24"
        fill="none"
        width={size}
        height={size}
        {...props}
    >
        <Path d="M8 6L21 6.00078M8 12L21 12.0008M8 18L21 18.0007M3 6.5H4V5.5H3V6.5ZM3 12.5H4V11.5H3V12.5ZM3 18.5H4V17.5H3V18.5Z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export default cssInterop(ListIcon, {
    className: {
        target: "style" as keyof IconProps,
    }
});
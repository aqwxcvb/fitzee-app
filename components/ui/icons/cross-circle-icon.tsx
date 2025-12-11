import { cssInterop } from "nativewind";
import Svg, { G, Path } from "react-native-svg";
import { IconProps } from "./types";

function CrossCircleIcon({ size = 24, strokeWidth = 2, ...props }: IconProps) {
    return (
        <Svg 
            fill="currentColor" 
            viewBox="0 0 24 24"
            width={size}
            height={size}
            {...props}
        >
            <G id="SVGRepo_bgCarrier" stroke-width="0"></G>
            <G id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></G>
            <G id="SVGRepo_iconCarrier">
                <Path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm3.71,12.29a1,1,0,0,1,0,1.42,1,1,0,0,1-1.42,0L12,13.42,9.71,15.71a1,1,0,0,1-1.42,0,1,1,0,0,1,0-1.42L10.58,12,8.29,9.71A1,1,0,0,1,9.71,8.29L12,10.58l2.29-2.29a1,1,0,0,1,1.42,1.42L13.42,12Z"></Path>
            </G>
        </Svg>
    );
}

export default cssInterop(CrossCircleIcon, {
    className: {
        target: "style" as keyof IconProps,
    }
});
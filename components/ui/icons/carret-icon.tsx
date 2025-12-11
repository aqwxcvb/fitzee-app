import { cssInterop } from "nativewind";
import Svg, { G, Path } from "react-native-svg";
import { IconProps } from "./types";

const CarretIcon = ({ size = 24, strokeWidth = 2, ...props }: IconProps) => (
    <Svg viewBox="0 0 24 24" fill="none" width={size} height={size} {...props}>
        <G id="SVGRepo_bgCarrier" stroke-width="0"></G>
        <G id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></G>
        <G id="SVGRepo_iconCarrier">
            <Path fill-rule="evenodd" clip-rule="evenodd" d="M6.29289 8.79289C6.68342 8.40237 7.31658 8.40237 7.70711 8.79289L12 13.0858L16.2929 8.79289C16.6834 8.40237 17.3166 8.40237 17.7071 8.79289C18.0976 9.18342 18.0976 9.81658 17.7071 10.2071L12.7071 15.2071C12.3166 15.5976 11.6834 15.5976 11.2929 15.2071L6.29289 10.2071C5.90237 9.81658 5.90237 9.18342 6.29289 8.79289Z" fill="currentColor" />
        </G>
    </Svg>
);

export default cssInterop(CarretIcon, {
    className: {
        target: "style" as keyof IconProps,
    }
});
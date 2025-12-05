import { Text, TextProps } from "react-native";

export function BigTitle(props: TextProps) {
    return <Text {...props} className={"text-[34px] font-sfpro-display-bold leading-tight tracking-tight text-content-strong dark:text-content-inverse " + (props.className ?? "")} />;
}

export function Title(props: TextProps) {
    return <Text {...props} className={"text-[24px] font-sfpro-display-bold leading-tight tracking-tight text-content-strong dark:text-content-inverse " + (props.className ?? "")} />;
}

export function Caption(props: TextProps) {
    return <Text {...props} className={"text-[12px] font-sfpro-medium tracking-wider uppercase text-content-strong dark:text-content-inverse " + (props.className ?? "")} />;
}

export function Headline(props: TextProps) {
    return <Text {...props} className={"text-[17px] font-sfpro-semibold tracking-tight text-content-strong dark:text-content-inverse " + (props.className ?? "")} />;
}

export function Body(props: TextProps) {
    return <Text {...props} className={"text-[15px] font-sfpro-regular leading-snug text-content-light dark:text-content-dark " + (props.className ?? "")} />;
}
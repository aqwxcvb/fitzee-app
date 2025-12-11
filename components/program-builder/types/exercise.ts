export interface Muscle {
    id: string;
    name: string;
    type: "primary" | "secondary";
    area: "upper" | "lower";
    perspective: "front" | "back";
}

export interface Exercise {
    id: number;
    name: string;
    muscles: Muscle[];
    icon?: string;
    type?: "exercise" | "group";
    children?: Exercise[];
}
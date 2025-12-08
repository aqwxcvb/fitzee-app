export interface Muscle {
    id: string;
    name: string;
    type: "primary" | "secondary";
    area: "upper" | "lower";
    perspective: "front" | "back";
}

export interface Exercise {
    id: string;
    name: string;
    muscles: Muscle[];
    icon: string;
    type?: "exercise" | "group";
    children?: Exercise[];
}
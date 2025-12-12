export interface Muscle {
    id: string;
    name: string;
    type: "primary" | "secondary";
    area: "upper" | "lower";
    perspective: "front" | "back";
}

export type WorkoutBuilderItem = {
    key: string;
    name: string;
    backgroundColor: string;
    isGroup?: boolean;
    children?: WorkoutBuilderItem[];
}
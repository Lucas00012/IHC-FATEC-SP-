import { Responsability } from "./value-entities";

export interface User {
    id?: number,
    name: string,
    email: string,
    password: string,
}

export interface Project {
    id?: number,
    name: string,
    creation: Date,
    allocations: Allocation[],
}

export interface Allocation {
    userId: number,
    responsability: Responsability
}
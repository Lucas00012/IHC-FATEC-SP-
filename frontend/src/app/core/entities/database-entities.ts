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
}

export interface Allocation {
    id?: number,
    projectId: number,
    userId: number,
    responsability: Responsability
}
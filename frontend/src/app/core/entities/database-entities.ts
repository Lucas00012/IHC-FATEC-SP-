import { Responsability, TaskStatus } from "./value-entities";

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
    tasks: Task[]
}

export interface Allocation {
    userId: number,
    responsability: Responsability
}

export interface Task {
    id?: string,
    userId: number | null,
    description: string,
    title: string,
    status: TaskStatus
}
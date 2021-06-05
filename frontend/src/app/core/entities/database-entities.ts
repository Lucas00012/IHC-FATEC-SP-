import { Responsability, TaskStatus, TaskType, MeetingType, MeetingStatus } from "./value-entities";

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
    tasks: Task[],
    meetings: Meeting[]
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
    status: TaskStatus,
    type: TaskType,
    epicId: string | null,
    storyPoints: number | null,
    minutesEstimated: number | null
}

export interface Meeting {
    id?: string,
    title: string,
    description: string,
    dateStart: Date,
    dateEnd: Date,
    minutesEstimated: number,
    participants: User[],
    decisions: MeetingDecision[],
    sprintId: string | null,
    creatorId: number | null,
    type: MeetingType,
    status: MeetingStatus
}

export interface MeetingDecision {
    description: string
}
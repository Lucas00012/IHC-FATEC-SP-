export enum Responsability {
    ScrumMaster="Scrum Master",
    ProductOwner="Product Owner",
    Employee="Membro",
}

export enum TaskStatus {
    Done="Concluída",
    InProgress="Em andamento",
    ToDo="Pendente"
}

export enum TaskType {
    Epic="Épico",
    UserStory="História de usuário",
    Task="Tarefa",
    Bug="Bug"
}

export enum MeetingStatus {
    Done="Concluída",
    InProgress="Em andamento",
    ToDo="Pendente",
    Canceled="Cancelada"
}

export enum MeetingType{
    Daily="Daily Scrum",
    Planning="Sprint Planning",
    Review="Sprint Review",
    Retrospective="Sprint Retrospective",
    GeneralPurpose="Outra"
}
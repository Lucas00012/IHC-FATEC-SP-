import { HttpClient } from "@angular/common/http";
import { Inject, Injectable, Optional } from "@angular/core";
import { AuthService } from "@core/auth/auth.service";
import { Allocation, Project, Task } from "@core/entities/database-entities";
import { Responsability, TaskType } from "@core/entities/value-entities";
import { buildQuery } from "@shared/utils/utils";
import { combineLatest, Observable, of, throwError } from "rxjs";
import { catchError, map, switchMap, take } from "rxjs/operators";
import { API_BASE_URL } from "./api.module";
import { v4 as uuidv4 } from 'uuid';
import { SprintsService } from "./sprint.api";

@Injectable({
    providedIn: "root"
})
export class ProjectsService {
    constructor(
        @Inject(HttpClient) private _http: HttpClient,
        @Optional() @Inject(API_BASE_URL) private _baseUrl: string,
        @Inject(AuthService) private _authService: AuthService,
        @Inject(SprintsService) private _sprintsService: SprintsService
    ) { }

    getAll(userId?: number, objQuery?: any): Observable<Project[]> {
        let query = buildQuery(objQuery);
        let url = `${this._baseUrl}/projects${query}`;

        return this._http.get<Project[]>(url).pipe(
            map((projects) => projects.filter(p => p.allocations.some(a => a.userId == userId))),
            catchError(_ => throwError("Erro ao obter os projetos."))
        )
    }

    get(id: number | undefined | null) {
        let url = `${this._baseUrl}/projects/${id}`;

        return this._http.get<Project>(url).pipe(
            catchError(_ => throwError("Projeto não encontrado."))
        )
    }

    add(project: Project, userId: number | undefined | null) {
        if(project.allocations.some(a => a.responsability == Responsability.ScrumMaster))
            throwError("O projeto só pode ter 1 Scrum Master");

        let url = `${this._baseUrl}/projects`;
        let allocations = <Allocation[]>[ ...project.allocations, { userId, responsability: Responsability.ScrumMaster } ];

        project = { ...project, allocations };

        return this._http.post<Project>(url, project).pipe(
            catchError(_ => throwError("Erro ao criar o projeto."))
        );
    }

    update(id: number, project: Project) {
        let url = `${this._baseUrl}/projects/${id}`;

        return this._authService.user$.pipe(
            take(1),
            switchMap(user => this.get(id).pipe(
                switchMap(project => !project.allocations.some(a => a.userId == user?.id && a.responsability == Responsability.ScrumMaster)
                    ? throwError("O projeto pertence a outro usuário")
                    : of(project)
                ),
                switchMap(_ => this._http.put<Project>(url, project))
            ))
        );
    }

    patch(id: number | undefined | null, body: any) {
        let url = `${this._baseUrl}/projects/${id}`;

        return this._authService.user$.pipe(
            take(1),
            switchMap(user => this.get(id).pipe(
                switchMap(project => !project.allocations.some(a => a.userId == user?.id && a.responsability == Responsability.ScrumMaster)
                    ? throwError("O projeto pertence a outro usuário")
                    : of(project)
                ),
                switchMap(_ => this._http.patch<Project>(url, body))
            ))
        );
    }

    addTask(id: number | undefined | null, body: Task) {
        let url = `${this._baseUrl}/projects/${id}`;

        return this._authService.user$.pipe(
            take(1),
            switchMap(user => this.get(id).pipe(
                switchMap(project => !project.allocations.some(a => a.userId == user?.id && (a.responsability == Responsability.ScrumMaster || a?.responsability === Responsability.ProductOwner))
                    ? throwError("O projeto pertence a outro usuário")
                    : of(project)
                ),
                map(project => {
                    let userExists = project.allocations?.some(u => u.userId == body.userId);

                    body.userId = userExists ? body.userId : null;
                    body.id = uuidv4();
                    project.tasks.push(body);

                    let allTasks = { tasks: project.tasks };
                    return allTasks;
                }),
                switchMap(tasks => this._http.patch<Project>(url, tasks))
            ))
        );
    }

    removeAllocation(id: number | undefined | null, userId: number) {
        let url = `${this._baseUrl}/projects/${id}`;

        return this._authService.user$.pipe(
            take(1),
            switchMap(user => this.get(id).pipe(
                switchMap(project => !project.allocations.some(a => a.userId == user.id && a.responsability == Responsability.ScrumMaster)
                    ? throwError("Você não pode excluir alocações")
                    : of(project)
                ),
                map(project => {
                    let allocations = project.allocations.filter(t => t.userId != userId);
                    let tasks = project.tasks.map(t => t.userId == userId ? { ...t, userId: null } : t);

                    return { allocations, tasks };
                }),
                switchMap(obj => this._http.patch<Project>(url, obj))
            ))
        );
    }

    addAllocation(id: number | undefined | null, body: Allocation) {
        let url = `${this._baseUrl}/projects/${id}`;

        return this._authService.user$.pipe(
            take(1),
            switchMap(user => this.get(id).pipe(
                switchMap(project => !project.allocations.some(a => a.userId == user.id && a.responsability == Responsability.ScrumMaster)
                    ? throwError("Você não pode adicionar alocação")
                    : of(project)
                ),
                switchMap(project => project.allocations.some(a => a.userId == body.userId)
                    ? throwError("O usuário já está alocado no projeto")
                    : of(project)
                ),
                map(project => {
                    project.allocations.push(body);

                    return { allocations: project.allocations };
                }),
                switchMap(obj => this._http.patch<Project>(url, obj))
            ))
        );
    }

    editAllocation(id: number | undefined | null, body: Allocation) {
        let url = `${this._baseUrl}/projects/${id}`;

        return this._authService.user$.pipe(
            take(1),
            switchMap(user => this.get(id).pipe(
                switchMap(project => !project.allocations.some(a => a.userId == user.id && a.responsability == Responsability.ScrumMaster)
                    ? throwError("Você não pode adicionar alocação")
                    : of(project)
                ),
                map(project => {
                    let allocation = project.allocations.find(a => a.userId == body.userId);
                    allocation.responsability = body.responsability;

                    return { allocations: project.allocations };
                }),
                switchMap(obj => this._http.patch<Project>(url, obj))
            ))
        );
    }

    removeTask(id: number | undefined | null, taskId: string | undefined) {
        let url = `${this._baseUrl}/projects/${id}`;

        return this._authService.user$.pipe(
            take(1),
            switchMap(user => this.get(id).pipe(
                switchMap(project => !project.allocations.some(a => a.userId == user?.id && (a.responsability == Responsability.ScrumMaster || a?.responsability === Responsability.ProductOwner))
                    ? throwError("Você não pode excluir tarefas")
                    : of(project)
                ),
                switchMap(project => this._sprintsService.getAll().pipe(
                    switchMap(sprints => sprints.some(s => s.tasksId.indexOf(taskId) >= 0)
                        ? throwError("Há uma SPRINT com essa tarefa")
                        : of(project))
                )),
                map(project => {
                    let tasks = project.tasks.filter(t => t.id != taskId);
                    tasks = tasks.map(t => t.epicId == taskId ? { ...t, epicId: null } : t);

                    return { tasks };
                }),
                switchMap(tasks => this._http.patch<Project>(url, tasks))
            ))
        );
    }

    updateTask(id: number | undefined | null, body: Task, taskId: string | undefined) {
        let url = `${this._baseUrl}/projects/${id}`;

        return this._authService.user$.pipe(
            take(1),
            switchMap(user => this.get(id).pipe(
                switchMap(project => !project.allocations.some(a => a.userId == user?.id)
                    ? throwError("Você não pertence ao projeto")
                    : of(project)
                ),
                map(project => {
                    let task = project.tasks.find(t => t.id == taskId);
                    let allocation = project.allocations?.find(u => u.userId == user?.id);

                    let userExists = project.allocations?.some(u => u.userId == body.userId);
                    let epicExists = project.tasks?.some(t => t.id == body.epicId && t.type === TaskType.Epic);

                    if (allocation?.responsability === Responsability.ScrumMaster || allocation?.responsability === Responsability.ProductOwner) {
                        task.title = body.title;
                        task.description = body.description;
                        task.userId = userExists ? body.userId : null;
                        task.status = body.status;
                        task.type = body.type;
                        task.minutesEstimated = body.minutesEstimated;
                        task.storyPoints = body.storyPoints;
                        
                        // If not epic, update epic Id
                        if(body.type !== TaskType.Epic){
                            task.epicId = epicExists ? body.epicId : null;
                        }
                    }
                    else {
                        task.status = body.status;
                    }

                    let allTasks = { tasks: project.tasks };
                    return allTasks;
                }),
                switchMap(tasks => this._http.patch<Project>(url, tasks))
            ))
        );
    }
}
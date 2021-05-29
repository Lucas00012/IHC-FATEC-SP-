import { HttpClient } from "@angular/common/http";
import { Inject, Injectable, Optional } from "@angular/core";
import { AuthService } from "@core/auth/auth.service";
import { Allocation, Project, Task } from "@core/entities/database-entities";
import { Responsability } from "@core/entities/value-entities";
import { buildQuery } from "@shared/utils/utils";
import { combineLatest, Observable, of, throwError } from "rxjs";
import { catchError, map, switchMap, take } from "rxjs/operators";
import { API_BASE_URL } from "./api.module";

@Injectable({
    providedIn: "root"
})
export class ProjectsService {
    constructor(
        @Inject(HttpClient) private _http: HttpClient,
        @Optional() @Inject(API_BASE_URL) private _baseUrl: string,
        @Inject(AuthService) private _authService: AuthService,
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

    add(project: Project, userId?: number) {
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
                switchMap(project => !project.allocations.some(a => a.userId == user?.id 
                        && (a.responsability == Responsability.ScrumMaster || a?.responsability === Responsability.ProductOwner))
                    ? throwError("O projeto pertence a outro usuário")
                    : of(project)
                ),
                map(project => {
                    let userExists = project.allocations?.some(u => u.userId == body.userId);
                    let userId = userExists ? body.userId : null;

                    body.userId = userId;
                    project.tasks.push(body);

                    let allTasks = { tasks: project.tasks };
                    return allTasks;
                }),
                switchMap(tasks => this._http.patch<Project>(url, tasks))
            ))
        );
    }

    removeTask(id: number | undefined | null, index: number) {
        let url = `${this._baseUrl}/projects/${id}`;

        return this._authService.user$.pipe(
            take(1),
            switchMap(user => this.get(id).pipe(
                switchMap(project => !project.allocations.some(a => a.userId == user?.id 
                        && (a.responsability == Responsability.ScrumMaster || a?.responsability === Responsability.ProductOwner))
                    ? throwError("Você não pode excluir tarefas")
                    : of(project)
                ),
                map(project => {
                    project.tasks.splice(index, 1);

                    let allTasks = { tasks: project.tasks };
                    return allTasks;
                }),
                switchMap(tasks => this._http.patch<Project>(url, tasks))
            ))
        );
    }

    updateTask(id: number | undefined | null, body: Task, index: number) {
        let url = `${this._baseUrl}/projects/${id}`;

        return this._authService.user$.pipe(
            take(1),
            switchMap(user => this.get(id).pipe(
                switchMap(project => !project.allocations.some(a => a.userId == user?.id)
                    ? throwError("Você não pertence ao projeto")
                    : of(project)
                ),
                map(project => {
                    let userExists = project.allocations?.some(u => u.userId == body.userId);
                    let userId = userExists ? body.userId : null;

                    body.userId = userId;

                    let allocation = project.allocations?.find(u => u.userId == user?.id);

                    if (allocation?.responsability === Responsability.ScrumMaster || allocation?.responsability === Responsability.ProductOwner)
                        project.tasks[index] = body;
                    else 
                        project.tasks[index].status = body.status;

                    let allTasks = { tasks: project.tasks };
                    return allTasks;
                }),
                switchMap(tasks => this._http.patch<Project>(url, tasks))
            ))
        );
    }
}
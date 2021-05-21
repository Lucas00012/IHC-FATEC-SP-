import { HttpClient } from "@angular/common/http";
import { Inject, Injectable, Optional } from "@angular/core";
import { Allocation, Project } from "@core/entities/database-entities";
import { Responsability } from "@core/entities/value-entities";
import { combineLatest, Observable, throwError } from "rxjs";
import { catchError, map, switchMap } from "rxjs/operators";
import { AllocationsService } from "./allocations.api";
import { API_BASE_URL } from "./api.module";

@Injectable({
    providedIn: "root"
})
export class ProjectsService {
    constructor(
        @Inject(HttpClient) private _http: HttpClient,
        @Optional() @Inject(API_BASE_URL) private _baseUrl: string,
        @Inject(AllocationsService) private _allocationsService: AllocationsService
    ) { }

    getAll(userId?: number): Observable<Project[]> {
        let url = `${this._baseUrl}/projects`;
        let objQuery = { userId };

        return this._allocationsService.getAll(objQuery).pipe(
            switchMap((allocations) => this._http.get<Project[]>(url).pipe(
                map((projects) => projects.filter(p => 
                    allocations.some(a => a.userId == userId && p.id == a.projectId)))
            )),
            catchError(_ => throwError("Erro ao obter os projetos."))
        )
    }

    get(id?: number) {
        let url = `${this._baseUrl}/projects/${id}`;

        return this._http.get<Project>(url).pipe(
            catchError(_ => throwError("Projeto não encontrado."))
        )
    }

    add(project: Project, allocations: Allocation[], userId?: number) {
        let url = `${this._baseUrl}/projects`;

        return this._http.post<Project>(url, project).pipe(
            map((project) =>
            <Allocation[]>[
                { projectId: project.id, userId, responsability: Responsability.ScrumMaster },
                ...allocations.map(a => ({ ...a, projectId: project.id }))
            ]),
            switchMap((allocations) => this._allocationsService.addMany(allocations)),
            catchError(_ => throwError("Erro ao criar o projeto."))
        );
    }

    update(project: Project, userId?: number) {
        let url = `${this._baseUrl}/projects`;

        return this._allocationsService.getAll().pipe(
            switchMap((allocations) => !allocations.some(a => a.userId == userId && a.responsability == Responsability.ScrumMaster)
                ? throwError("O projeto pertence a outro usuário")
                : this._http.put<Project>(url, project)
            )
        );
    }
}
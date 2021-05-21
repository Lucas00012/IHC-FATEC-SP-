import { HttpClient } from "@angular/common/http";
import { Inject, Injectable, Optional } from "@angular/core";
import { Allocation, Project } from "@core/entities/database-entities";
import { Responsability } from "@core/entities/value-entities";
import { combineLatest, Observable, of, throwError } from "rxjs";
import { catchError, map, switchMap } from "rxjs/operators";
import { API_BASE_URL } from "./api.module";

@Injectable({
    providedIn: "root"
})
export class ProjectsService {
    constructor(
        @Inject(HttpClient) private _http: HttpClient,
        @Optional() @Inject(API_BASE_URL) private _baseUrl: string,
    ) { }

    getAll(userId?: number): Observable<Project[]> {
        let url = `${this._baseUrl}/projects`;

        return this._http.get<Project[]>(url).pipe(
            map((projects) => projects.filter(p => p.allocations.some(a => a.userId == userId))),
            catchError(_ => throwError("Erro ao obter os projetos."))
        )
    }

    get(id?: number) {
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

    update(id: number, project: Project, userId?: number) {
        let url = `${this._baseUrl}/projects/${id}`;

        return this.get(id).pipe(
            switchMap((project) => !project.allocations.some(a => a.userId == userId && a.responsability == Responsability.ScrumMaster)
                ? throwError("O projeto pertence a outro usuário")
                : of(project)
            ),
            switchMap(_ => this._http.put<Project>(url, project))
        )
    }
}
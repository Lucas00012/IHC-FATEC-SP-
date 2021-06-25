import { HttpClient } from "@angular/common/http";
import { Inject, Injectable, Optional } from "@angular/core";
import { AuthService } from "@core/auth/auth.service";
import { Sprint } from "@core/entities/database-entities";
import { buildQuery } from "@shared/utils/utils";
import { throwError } from "rxjs";
import { catchError, map, switchMap } from "rxjs/operators";
import { API_BASE_URL } from "./api.module";

@Injectable({
    providedIn: "root"
})
export class SprintsService {
    constructor(
        @Inject(HttpClient) private _http: HttpClient,
        @Optional() @Inject(API_BASE_URL) private _baseUrl: string,
        @Inject(AuthService) private _authService: AuthService,
    ) { }

    getAll(objQuery?: any) {
        let query = buildQuery(objQuery);
        let url = `${this._baseUrl}/sprints${query}`;

        return this._http.get<Sprint[]>(url).pipe(
            catchError(_ => throwError("Erro ao obter a sprint."))
        );
    }

    get(id: number | undefined | null) {
        let url = `${this._baseUrl}/sprints/${id}`;

        return this._http.get<Sprint>(url).pipe(
            catchError(_ => throwError("Sprint não encontrada."))
        );
    }

    add(body: Sprint) {
        let url = `${this._baseUrl}/sprints`;

        return this.getAll({ projectId: body.projectId }).pipe(
            switchMap((sprints) => {
                if (sprints.some(s => !s.endDate && s.projectId == body.projectId)) {
                    return throwError("Tente mais tarde")
                }

                return this._http.post<Sprint>(url, body).pipe(
                    catchError(_ => throwError("Tente mais tarde"))
                );
            })
        );
    }

    update(id: number | undefined | null, body: Sprint) {
        let url = `${this._baseUrl}/sprints/${id}`;

        return this._http.put(url, body).pipe(
            catchError(_ => throwError("Erro ao atualizar a sprint."))
        );
    }

    closeSprint(id: number | undefined | null) {
        let url = `${this._baseUrl}/sprints/${id}`;
        let body = { endDate: Date.now() };

        return this._http.patch<Sprint>(url, body).pipe(
            catchError(_ => throwError("Erro ao fechar a sprint"))
        );
    }
}
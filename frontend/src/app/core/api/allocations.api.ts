import { HttpClient } from "@angular/common/http";
import { Inject, Injectable, Optional } from "@angular/core";
import { Allocation } from "@core/entities/database-entities";
import { buildQuery } from "@shared/utils/utils";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { API_BASE_URL } from "./api.module";

@Injectable({
    providedIn: "root"
})
export class AllocationsService {
    constructor(
        @Inject(HttpClient) private _http: HttpClient,
        @Optional() @Inject(API_BASE_URL) private _baseUrl: string
    ) { }

    getAll(objQuery?: any): Observable<Allocation[]> {
        let query = buildQuery(objQuery);
        let url = `${this._baseUrl}/allocations${query}`;

        return this._http.get<Allocation[]>(url).pipe(
            catchError(_ => throwError("Erro ao obter as alocações."))
        );
    }

    get(id?: number) {
        let url = `${this._baseUrl}/allocations/${id}`;

        return this._http.get<Allocation>(url).pipe(
            catchError(_ => throwError("Alocação não encontrada."))
        )
    }

    add(allocation: Allocation) {
        let url = `${this._baseUrl}/allocations`;

        return this._http.post<Allocation>(url, allocation).pipe(
            catchError(_ => throwError("Erro ao cadastrar a alocação."))
        )
    }

    addMany(allocations: Allocation[]) {
        let url = `${this._baseUrl}/allocations`;
        
        return this._http.post<Allocation[]>(url, allocations).pipe(
            catchError(_ => throwError("Erro ao cadastrar as alocações."))
        )
    }

    update(allocation: Allocation) {
        let url = `${this._baseUrl}/allocations`;

        return this._http.put<Allocation>(url, allocation).pipe(
            catchError(_ => throwError("Erro ao atualizar os dados."))
        )
    }
}
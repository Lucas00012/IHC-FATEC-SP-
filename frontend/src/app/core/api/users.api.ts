import { HttpClient } from "@angular/common/http";
import { Inject, Injectable, Optional } from "@angular/core";
import { User } from "@core/entities/database-entities";
import { Observable, of, throwError } from "rxjs";
import { catchError, map, switchMap } from "rxjs/operators";
import { API_BASE_URL } from "./api.module";
import { buildQuery } from "./utils";

@Injectable({
    providedIn: "root"
})
export class UsersService {
    constructor(
        @Inject(HttpClient) private _http: HttpClient,
        @Optional() @Inject(API_BASE_URL) private _baseUrl: string
    ) { }

    getAll(objQuery?: any): Observable<User[]> {
        let query = buildQuery(objQuery);
        let url = `${this._baseUrl}/users${query}`;

        return this._http.get<User[]>(url).pipe(
            catchError(_ => throwError("Erro ao obter os usuários."))
        );
    }

    get(id?: number) {
        let url = `${this._baseUrl}/users/${id}`;

        return this._http.get<User>(url).pipe(
            catchError(_ => throwError("Usuário não encontrado."))
        )
    }

    add(user: User) {
        let url = `${this._baseUrl}/users`;

        return this._http.post<User>(url, user).pipe(
            catchError(_ => throwError("Erro ao cadastrar o usuário."))
        )
    }

    update(user: User) {
        let url = `${this._baseUrl}/users`;

        return this._http.put<User>(url, user).pipe(
            catchError(_ => throwError("Erro ao atualizar os dados."))
        )
    }

    login(email: string, password: string) {
        let objQuery = { email, password };

        return this.getAll(objQuery).pipe(
            map((users) => users[0]),
            switchMap((user) => !user 
                ? throwError("Erro ao realizar o login. Verifique seus dados e tente novamente.")
                : of(user)
            )
        );
    }

    changePassword(oldPassword: string, newPassword: string, id?: number) {
        let url = `${this._baseUrl}/users/${id}`;
        let body = { password: newPassword };

        return this.get(id).pipe(
            switchMap((user) => user.password != oldPassword 
                ? throwError("A senha atual não foi confirmada corretamente.") 
                : of(user)
            ),
            switchMap(_ => this._http.patch<User>(url, body))
        );
    }
}
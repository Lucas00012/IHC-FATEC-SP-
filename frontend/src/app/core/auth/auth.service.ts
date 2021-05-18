import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject } from "rxjs";
import { map, shareReplay } from "rxjs/operators";
import { User } from "../entities/database-entities";

const USER_KEY = "scrup_app_user";

@Injectable({
    providedIn: "root"
})
export class AuthService {

    constructor(
        private _router: Router
    ) { }
    
    private get _user(): User | null {
        return JSON.parse(localStorage.getItem(USER_KEY) || "null");
    }

    private get _isLogged(): boolean {
        return !!this._user;
    }

    private _reload$ = new BehaviorSubject<void | null>(null);

    user$ = this._reload$.pipe(
        map(_ => this._user), 
        shareReplay(1)
    );

    isLogged$ = this._reload$.pipe(
        map(_ => this._isLogged), 
        shareReplay(1)
    );

    logout() {
        localStorage.removeItem(USER_KEY);
        this.reload();

        this._router.navigate([""]);
    }

    login(user: User) {
        this.load(user);

        this._router.navigate([""]);
    }

    load(user: User) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        this.reload();
    }

    private reload() {
        this._reload$.next();
    }
}
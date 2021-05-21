import { Component } from "@angular/core";
import { AuthService } from "@core/auth/auth.service";
import { interval } from "rxjs";
import { map, startWith } from "rxjs/operators";

@Component({
    templateUrl: "./project.component.html",
    styleUrls: ["./project.component.scss"]
})
export class ProjectComponent {
    constructor(
        private _authService: AuthService
    ) { }

    user$ = this._authService.user$;
    
    now$ = interval(1000).pipe(
        startWith(null),
        map(_ => Date.now())
    );
}
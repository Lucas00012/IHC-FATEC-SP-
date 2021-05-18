import { Component } from "@angular/core";
import { ProjectsService } from "@core/api/projects.api";
import { AuthService } from "@core/auth/auth.service";
import { map, switchMap } from "rxjs/operators";

@Component({
    templateUrl: "./list.component.html",
    styleUrls: ["./list.component.scss"]
})
export class ListComponent {

    constructor(
        private _authService: AuthService,
        private _projectsService: ProjectsService
    ) { }

    user$ = this._authService.user$;

    projects$ = this.user$.pipe(
        map((user) => {
            let objQuery = {
                userId: user?.id 
            }
            return objQuery;
        }),
        switchMap((objQuery) => this._projectsService.getAll(objQuery))
    );
}
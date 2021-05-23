import { Component } from "@angular/core";
import { ProjectsService } from "@core/api/projects.api";
import { AuthService } from "@core/auth/auth.service";
import { debounceTime, map, switchMap } from "rxjs/operators";

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
        debounceTime(500),
        switchMap(user => this._projectsService.getAll(user?.id).pipe(
            map(projects => projects.map(p => 
                ({ 
                    ...p, 
                    currentFunction: p.allocations.find(a => a.userId == user?.id)?.responsability 
                })
            ))
        )),
    );
}
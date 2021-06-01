import { Component } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { ProjectsService } from "@core/api/projects.api";
import { AuthService } from "@core/auth/auth.service";
import { fromForm } from "@shared/utils/utils";
import { combineLatest } from "rxjs";
import { debounceTime, map, switchMap, tap } from "rxjs/operators";

@Component({
    templateUrl: "./list.component.html",
    styleUrls: ["./list.component.scss"]
})
export class ListComponent {

    constructor(
        private _authService: AuthService,
        private _projectsService: ProjectsService,
        private _fb: FormBuilder
    ) { }

    form = this._fb.group({
        name_like: [""],
    });

    fetching = true;

    filter$ = fromForm(this.form);

    user$ = this._authService.user$;

    projects$ = combineLatest([this.user$, this.filter$]).pipe(
        tap(_ => this.fetching = true),
        debounceTime(500),
        switchMap(([user, filter]) => this._projectsService.getAll(user.id, filter).pipe(
            map(projects => projects.map(project => 
                ({ 
                    ...project, 
                    currentFunction: project.allocations.find(a => a.userId == user.id).responsability 
                })
            ))
        )),
        tap(_ => this.fetching = false)
    );
}
import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { ProjectsService } from "@core/api/projects.api";
import { AuthService } from "@core/auth/auth.service";
import { Observable, of } from "rxjs";
import { catchError, switchMap } from "rxjs/operators";
import { ProjectFeatureService } from "./project-feature.service";

@Injectable()
export class ProjectGuard implements CanActivate {

    constructor(
        private _projectFeatureService: ProjectFeatureService,
        private _projectsService: ProjectsService,
        private _authService: AuthService,
        private _router: Router
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
        let param = route.paramMap.get("projectId");
        let projectId = param ? parseInt(param) : null;

        this._projectFeatureService.updateCurrentProjectId(projectId);

        if (!projectId) return true;

        return this._projectsService.get(projectId).pipe(
            switchMap(project => this._authService.user$.pipe(
                switchMap(user => {
                    if (!project) return this._router.navigate([""]);

                    let allocation = project.allocations.find(a => a.userId == user?.id);

                    if (!allocation) return this._router.navigate([""]);

                    return of(true);
                })
            )),
            catchError(_ => this._router.navigate([""]))
        )
    }
}
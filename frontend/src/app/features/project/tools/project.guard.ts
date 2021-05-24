import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { ProjectsService } from "@core/api/projects.api";
import { AuthService } from "@core/auth/auth.service";
import { combineLatest, Observable, of } from "rxjs";
import { catchError, delay, switchMap } from "rxjs/operators";
import { ProjectFeatureService } from "./project-feature.service";

@Injectable()
export class ProjectGuard implements CanActivate {

    constructor(
        private _projectFeatureService: ProjectFeatureService,
        private _router: Router
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
        let param = route.paramMap.get("projectId");
        let projectId = param ? parseInt(param) : null;

        this._projectFeatureService.updateCurrentProjectId(projectId);

        return combineLatest([
            this._projectFeatureService.currentProject$,
            this._projectFeatureService.currentAllocation$
        ]).pipe(
            switchMap(([project, allocation]) => {
                if(projectId && !project) return this._router.navigate([""]);
                if(project && !allocation) return this._router.navigate([""]);
                
                return of(true);
            }
        ));
    }
}
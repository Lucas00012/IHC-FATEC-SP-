import { Inject, Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { ProjectsService } from "@core/api/projects.api";
import { SprintsService } from "@core/api/sprint.api";
import { UsersService } from "@core/api/users.api";
import { AuthService } from "@core/auth/auth.service";
import { Responsability } from "@core/entities/value-entities";
import { BehaviorSubject, combineLatest, of } from "rxjs";
import { catchError, map, shareReplay, switchMap, tap } from "rxjs/operators";

@Injectable()
export class ProjectFeatureService {
    constructor(
        private _projectsService: ProjectsService,
        private _sprintsService: SprintsService,
        private _authService: AuthService,
        private _usersService: UsersService,
        private _router: Router
    ) { }

    projectReload$ = new BehaviorSubject<void | null>(null);

    projectOptions$ = combineLatest([
        this._authService.user$, 
        this.projectReload$
    ]).pipe(
        switchMap(([user]) => this._projectsService.getAll(user?.id)),
        shareReplay(1)
    );

    currentProjectId$ = new BehaviorSubject<number | null>(null);

    currentProject$ = this.currentProjectId$.pipe(
        switchMap(id => this.projectOptions$.pipe(
            map(projects => projects.find(p => p.id == id))
        )),
        shareReplay(1)
    );

    currentAllocation$ = combineLatest([
        this._authService.user$, 
        this.currentProject$
    ]).pipe(
        map(([user, project]) => project?.allocations.find(a => a.userId == user?.id)),
        shareReplay(1)
    );

    isScrumMaster$ = this.currentAllocation$.pipe(
        map(allocation => allocation?.responsability == Responsability.ScrumMaster)
    );

    isProductOwner$ = this.currentAllocation$.pipe(
        map(allocation => allocation?.responsability == Responsability.ProductOwner)
    );

    usersProject$ = combineLatest([
        this._usersService.getAll(),
        this.currentProject$
    ]).pipe(
        map(([users, project]) => users.filter(u => 
            project?.allocations.some(a => a.userId == u.id))),
        shareReplay(1)
    );

    usersProjectExceptCurrent$ = combineLatest([
        this.usersProject$,
        this._authService.user$
    ]).pipe(
        map(([usersProject, user]) => usersProject?.filter(u => u.id !== user.id)),
        shareReplay(1)
    );

    private _currentSprint$ = combineLatest([
        this.currentProjectId$, 
        this.projectReload$
    ]).pipe(
        switchMap(([projectId]) => this._sprintsService.getAll({ projectId })),
        map((sprints) => sprints.filter(s => !s.endDate)),
        map((sprints) => sprints[0]),
        shareReplay(1)
    );

    currentSprint$ = combineLatest([
        this._currentSprint$,
        this.currentProject$
    ]).pipe(
        map(([sprint, project]) => {
            if (!sprint) return null;
            return {
                ...sprint,
                tasks: project?.tasks?.filter(t => sprint.tasksId.indexOf(t.id) >= 0)
            }
        }),
        shareReplay(1)
    );

    updateCurrentProjectId(id: number | null) {
        this.currentProjectId$.next(id);
    }

    notifyProjectChanges() {
        this.projectReload$.next();
    }
}
import { Component, Input } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { ProjectsService } from "@core/api/projects.api";
import { SprintsService } from '@core/api/sprint.api';
import { AuthService } from "@core/auth/auth.service";
import { TaskStatus, TaskType } from "@core/entities/value-entities";
import { ProjectFeatureService } from "@features/project/tools/project-feature.service";
import { PrintSnackbarService } from "@shared/print-snackbar/print-snackbar.service";
import { fromForm, insensitiveContains } from "@shared/utils/utils";
import { combineLatest } from "rxjs";
import { catchError, filter, map, switchMap, tap } from "rxjs/operators";
import { TaskAddDialogComponent } from "./task-add-dialog/task-add-dialog.component";

@Component({
    selector: "app-list-project-tasks",
    templateUrl: "./list-project-tasks.component.html",
    styleUrls: ["./list-project-tasks.component.scss"]
})
export class ListProjectTasksComponent {

    constructor(
        private _dialog: MatDialog,
        private _projectsService: ProjectsService,
        private _printService: PrintSnackbarService,
        private _projectFeatureService: ProjectFeatureService,
        private _authService: AuthService,
        private _sprintService: SprintsService,
        private _fb: FormBuilder
    ) { }

    form = this._fb.group({
        status: ["Todas"],
        title: [""],
        onlyAssigned: [false]
    });

    @Input() projectId!: number | null;

    taskStatusOptions = ["Todas", ...Object.values(TaskStatus)];

    allocation$ = this._projectFeatureService.currentAllocation$;
    isProductOwner$ = this._projectFeatureService.isProductOwner$;
    isScrumMaster$ = this._projectFeatureService.isScrumMaster$;
    project$ = this._projectFeatureService.currentProject$;
    user$ = this._authService.user$;
    projectReload$ = this._projectFeatureService.projectReload$;

    form$ = fromForm(this.form);

    isSpecial$ = combineLatest([
        this.isProductOwner$, 
        this.isScrumMaster$
    ]).pipe(
        map(([isProductOwner, isScrumMaster]) => isProductOwner || isScrumMaster)
    );

    sprint$ = this._projectFeatureService.currentSprint$;

    sprintTasks$ = combineLatest([
        this.form$, 
        this.project$, 
        this.allocation$, 
        this.sprint$
    ]).pipe(
        map(([form, project, allocation, sprint]) => {
            if (!project) return [];
            if (!sprint) return [];

            let tasks = sprint.tasks;

            if (form.status != "Todas")
                tasks = tasks.filter(t => t.status == form.status);

            if (form.onlyAssigned)
                tasks = tasks.filter(t => t.userId == allocation.userId);

            tasks = tasks.filter(t => insensitiveContains(t.title, form.title));
            
            return tasks;
        })
    );

    sprints$ = this.projectReload$.pipe(
        switchMap(_ => this._sprintService.getAll({ projectId: this.projectId }))
    ); 

    tasks$ = combineLatest([this.form$, this.project$, this.allocation$, this.sprint$, this.sprints$]).pipe(
        map(([form, project, allocation, sprint, sprints]) => {
            if (!project) return [];

            let tasks = project.tasks;

            if (form.status != "Todas")
                tasks = tasks.filter(t => t.status == form.status);

            if (form.onlyAssigned)
                tasks = tasks.filter(t => t.userId == allocation.userId);

            tasks = tasks.filter(t => insensitiveContains(t.title, form.title));

            if(sprint){
                let sprintTaskIds = sprint.tasksId;
                tasks = tasks.filter(t => !sprintTaskIds.includes(t.id));
            }

            sprints = sprints.filter(t => t.endDate);

            if(sprints){
                sprints.forEach(element => {
                    tasks = tasks.filter(t => !(t.status == TaskStatus.Done && element.tasksId.includes(t.id)));
                });
            }

            return tasks;
        })
    );

    info$ = combineLatest([this.user$, this.isSpecial$]);

    addTask() {
        this._dialog.open(TaskAddDialogComponent, {
            width: "400px",
            height: "520px"
        }).afterClosed().pipe(
            filter(body => !!body),
            switchMap(body => this._projectsService.addTask(this.projectId, body)),
            tap(_ => this._printService.printSuccess("Tarefa cadastrada com sucesso!")),
            tap(_ => this._projectFeatureService.notifyProjectChanges()),
            catchError(err => this._printService.printError("Erro ao cadastrar a tarefa", err))
        ).subscribe();
    }
}
import { Component, Input } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { ProjectsService } from "@core/api/projects.api";
import { UsersService } from "@core/api/users.api";
import { AuthService } from "@core/auth/auth.service";
import { Project, Task } from "@core/entities/database-entities";
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

    form$ = fromForm(this.form);

    tasks$ = combineLatest([this.form$, this.project$, this.allocation$]).pipe(
        map(([form, project, allocation]) => {
            if (!project) return [];

            let tasks = project.tasks;

            if (form.status != "Todas")
                tasks = tasks.filter(t => t.status == form.status);

            if (form.onlyAssigned)
                tasks = tasks.filter(t => t.userId == allocation.userId);

            tasks = tasks.filter(t => insensitiveContains(t.title, form.title));

            return tasks;
        })
    )

    isSpecial$ = combineLatest([
        this.isProductOwner$, 
        this.isScrumMaster$
    ]).pipe(
        map(([isProductOwner, isScrumMaster]) => isProductOwner || isScrumMaster)
    );

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

    updateTask(body: any, taskId: string) {
        this._projectsService.updateTask(this.projectId, body, taskId).pipe(
            tap(_ => this._printService.printSuccess("Tarefa atualizada com sucesso!")),
            tap(_ => this._projectFeatureService.notifyProjectChanges()),
            catchError(err => this._printService.printError("Erro ao atualizar a tarefa", err))
        ).subscribe();
    }

    deleteTask(taskId: string) {
        this._projectsService.removeTask(this.projectId, taskId).pipe(
            tap(_ => this._printService.printSuccess("Tarefa excluida com sucesso!")),
            tap(_ => this._projectFeatureService.notifyProjectChanges()),
            catchError(err => this._printService.printError("Erro ao excluir a tarefa", err))
        ).subscribe();
    }
}